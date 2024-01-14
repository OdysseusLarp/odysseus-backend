import 'dotenv/config';
import { Server } from 'http';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import socketIo from 'socket.io';
import { logger, loggerMiddleware } from './logger';
import { loadSwagger } from './docs';
import { getEmptyEpsilonClient, setStateRouteHandler } from './emptyepsilon';
import { loadEvents } from './eventhandler';
import { loadMessaging, router as messaging } from './messaging';
import { Store } from './models/store';
import { errorHandlingMiddleware, handleAsyncErrors } from './routes/helpers';
import { get, isEqual, omit, isEmpty } from 'lodash';
import cors from 'cors';

import prometheusIoMetrics from 'socket.io-prometheus';
import prometheusMiddleware from 'express-prometheus-middleware';

import { initStoreSocket } from './store/storeSocket';
import { initState } from './store/store';
import { enableGracefulShutdown, enablePersistance } from './store/storePersistance';
import fleet from './routes/fleet';
import starmap from './routes/starmap';
import person from './routes/person';
import event from './routes/event';
import post from './routes/post';
import vote from './routes/vote';
import log from './routes/log';
import science from './routes/science';
import tag from './routes/tag';
import operation from './routes/operation';
import sip from './routes/sip';
import storyAdminRoutes from './routes/story-admin';
import { setData, getData, router as data } from './routes/data';
import infoboard from './routes/infoboard';
import dmxRoutes from './routes/dmx';
import { loadRules } from './rules/rules';

const app = express();
const http = new Server(app);
const io = socketIo(http);

// Setup logging middleware and body parsing
app.use(bodyParser.json());
app.use(loggerMiddleware);
app.use(cors());

/**
 * Get Prometheus metrics of all API routes and Socket.IO clients
 * @route GET /metrics
 * @group Metrics - Prometheus metrics
 * @produces text/plain
 * @returns {string} 200 - Prometheus metrics
 */
app.use(prometheusMiddleware({
	metricsPath: '/metrics',
	collectDefaultMetrics: true,
	requestDurationBuckets: [0.1, 0.5, 1, 1.5],
}));
// Also export prometheus metrics of Socket.IO, available via same /metrics route
prometheusIoMetrics(io);

// Add Socket.IO reference to all requests so route handlers can call it
app.use((req, res, next) => {
	(<any>req).io = io;
	next();
});

// Setup routes
app.get('/', (req: Request, res: Response) => res.redirect('/api-docs'));
app.use('/fleet', fleet);
app.use('/starmap', starmap);
app.use('/person', person);
app.use('/event', event);
app.use('/post', post);
app.use('/vote', vote);
app.use('/log', log);
app.use('/science', science);
app.use('/data', data);
app.use('/infoboard', infoboard);
app.use('/dmx', dmxRoutes);
app.use('/messaging', messaging);
app.use('/tag', tag);
app.use('/operation', operation);
app.use('/sip', sip);
app.use('/story', storyAdminRoutes);

// Empty Epsilon routes
app.put('/state', setStateRouteHandler);

/**
 * Push the full state from ship/ee data store to EmptyEpsilon. This will completely overwrite the current EmptyEpsilon state.
 * @route POST /state/full-push
 * @group EmptyEpsilon - EmptyEpsilon integration
 * @returns {object} 200 - Object containing success: true/false
 */
app.post('/state/full-push', handleAsyncErrors(async (req, res) => {
	const state = getData('ship', 'ee');
	if (isEmpty(state)) throw new Error('Empty Epsilon state is empty');
	const response = await getEmptyEpsilonClient().pushFullGameState(state);
	res.json(response);
}));

/**
 * Emit any Socket.IO event manually
 * @route POST /emit/{eventName}
 * @consumes application/json
 * @group SocketIO - Operations related to Socket.IO
 * @param {string} eventName.path.required - Name/Key of the Socket.IO event
 * @param {object} data.body - Data to be emitted to clients
 * @returns {object} 204 - Empty response
 */
app.post('/emit/:eventName', (req, res) => {
	const { eventName } = req.params;
	io.emit(eventName, req.body || {});
	res.sendStatus(204);
});

// Error handling middleware
app.use(errorHandlingMiddleware);

// Setup Socket.IO
io.on('connection', socket => {
	logger.info('Socket.IO Client connected');
	socket.on('disconnect', () => {
		logger.info('Socket.IO Client disconnected');
	});
});
loadMessaging(io);

// Get latest Empty Epsilon game state and save it to store
// TODO: This is a stupid location for this method
export function updateEmptyEpsilonState() {
	// Exit straight away if EE connection is disabled. It needs to be disabled before
	// the EE server is launched, because the EE HTTP server is buggy and will crash the
	// game server if it gets a request before fully loading.
	const isEeConnectionEnabled = !!get(getData('ship', 'metadata'), 'ee_connection_enabled');
	if (!isEeConnectionEnabled) return;

	return getEmptyEpsilonClient().getGameState().then(state => {
		const metadataKeys = ['id', 'type', 'created_at', 'updated_at', 'version'];
		// Save Empty Epsilon connection status to EE metadata blob
		const connectionStatus = getEmptyEpsilonClient().getConnectionStatus();
		const previousConnectionStatus = omit(getData('ship', 'ee_metadata'), metadataKeys);
		if (!isEqual(connectionStatus, previousConnectionStatus)) setData('ship', 'ee_metadata', connectionStatus, true);
		// Do not update state if request to EE failed
		if (state.error) return;
		// Do not update state if EE sync is disabled
		if (!get(getData('ship', 'metadata'), 'ee_sync_enabled')) return;
		const currentState = omit(getData('ship', 'ee'), metadataKeys);
		// Do not update state if state has not changed
		if (isEqual(state, currentState)) return;
		setData('ship', 'ee', state, true);
	});
}

// Load current events
loadEvents(io);

// Load initial state from database before starting the HTTP listener and loading rules
Store.forge({ id: 'data' }).fetch().then(model => {
	const data = model ? model.get('data') : {};
	initState(data);
	logger.info('Redux state initialized');
	enablePersistance();
	enableGracefulShutdown();
	loadRules();
	startServer();

	const EE_UPDATE_INTERVAL = parseInt(process.env.EMPTY_EPSILON_UPDATE_INTERVAL_MS || '1000', 10);
	logger.watch(`Starting to poll Empty Epsilon game state every ${EE_UPDATE_INTERVAL}ms`);
	setInterval(updateEmptyEpsilonState, EE_UPDATE_INTERVAL);
});

// Generate and serve API documentation using Swagger at /api-docs
loadSwagger(app);

initStoreSocket(io);

function startServer() {
	const { APP_PORT } = process.env;
	http.listen(APP_PORT, () => logger.start(`Odysseus backend listening to port ${APP_PORT}`));
}

// Health check route
app.get('/ping', (req, res) => {
	res.send('pong');
});

// For emitting Socket.IO events from rule files
export function getSocketIoClient() {
	return io;
}
