require('dotenv').config({ silent: true });
const app = require('express')();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);
import { logger, loggerMiddleware } from './logger';
import { loadSwagger } from './docs';
import { getEmptyEpsilonClient, setStateRouteHandler } from './emptyepsilon';
import { loadEvents } from './eventhandler';
import { loadMessaging, router as messaging } from './messaging';
import { Store } from './models/store';
import { handleAsyncErrors } from './helpers';
import { get, isEqual, omit, isEmpty } from 'lodash';
import cors from 'cors';

import { initStoreSocket } from './store/storeSocket';
import { initState } from './store/store';
import './store/storePersistance';
import fleet from './routes/fleet';
import starmap from './routes/starmap';
import person from './routes/person';
import event from './routes/event';
import post from './routes/post';
import vote from './routes/vote';
import log from './routes/log';
import science from './routes/science';
import { setData, getData, router as data } from './routes/data';
import infoboard from './routes/infoboard';

import './rules/rules';

// Setup logging middleware and body parsing
app.use(bodyParser.json());
app.use(loggerMiddleware);
app.use(cors());

// Add Socket.IO reference to all requests so route handlers can call it
app.use((req, res, next) => {
	req.io = io;
	next();
});

// Setup routes
app.get('/', (req, res) => res.redirect('/api-docs'));
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
app.use('/messaging', messaging);

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
app.use(async (err, req, res, next) => {
	logger.error(err.message);
	return res.status(err.status || 500).json({ error: err.message });
});

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

const EE_UPDATE_INTERVAL = parseInt(process.env.EMPTY_EPSILON_UPDATE_INTERVAL_MS || '1000', 10);
logger.watch(`Starting to poll Empty Epsilon game state every ${EE_UPDATE_INTERVAL}ms`);
setInterval(updateEmptyEpsilonState, EE_UPDATE_INTERVAL);

// Load initial state from database before starting the HTTP listener
Store.forge({ id: 'data' }).fetch().then(model => {
	const data = model ? model.get('data') : {};
	initState(data);
	logger.info('State initialized');
	startServer();
});

// Generate and serve API documentation using Swagger at /api-docs
loadSwagger(app);

initStoreSocket(io);

function startServer() {
	const { APP_PORT } = process.env;
	http.listen(APP_PORT, () => logger.start(`Odysseus backend listening to port ${APP_PORT}`));
}

// For emitting Socket.IO events from rule files
export function getSocketIoClient() {
	return io;
}
