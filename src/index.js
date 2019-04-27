require('dotenv').config({ silent: true });
const app = require('express')();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);
import { logger, loggerMiddleware } from './logger';
import { loadSwagger } from './docs';
import { getEmptyEpsilonClient, setStateRouteHandler } from './emptyepsilon';
import { loadEvents } from './eventhandler';
import { loadMessaging } from './messaging';
import { Store } from './models/store';
import { isEqual, omit } from 'lodash';
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
app.put('/state', setStateRouteHandler);
app.use('/data', data);
app.use('/infoboard', infoboard);

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
function getEmptyEpsilonState() {
	// TODO: Validate state and make sure that EE mission did not just change
	getEmptyEpsilonClient().getGameState().then(state => {
		if (state.error) return;
		const metadataKeys = ['id', 'type', 'created_at', 'updated_at', 'version'];
		const currentState = omit(getData('ship', 'ee'), metadataKeys);
		if (isEqual(state, currentState)) return;
		setData('ship', 'ee', state, true);
	});
}

// Load current events
loadEvents(io);

const EE_UPDATE_INTERVAL = parseInt(process.env.EMPTY_EPSILON_UPDATE_INTERVAL_MS || '1000', 10);
logger.watch(`Starting to poll Empty Epsilon game state every ${EE_UPDATE_INTERVAL}ms`);
setInterval(getEmptyEpsilonState, EE_UPDATE_INTERVAL);

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

export { app };
