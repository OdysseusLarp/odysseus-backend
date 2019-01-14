require('dotenv').config({ silent: true });
const app = require('express')();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);
import { logger, loggerMiddleware } from './logger';
import { loadSwagger } from './docs';
import { getEmptyEpsilonClient, setStateRouteHandler } from './emptyepsilon';
import { loadInitialTasks } from './engineering/tasks';
import { loadEvents } from './eventhandler';
import { loadMessaging } from './messaging';
import cors from 'cors';

import engineering from './routes/engineering';
import fleet from './routes/fleet';
import starmap from './routes/starmap';
import person from './routes/person';
import event from './routes/event';
import post from './routes/post';
import vote from './routes/vote';
import log from './routes/log';
import infoboard from './routes/infoboard';
import science from './routes/science';

// Setup logging middleware and body parsing
app.use(bodyParser.json());
app.use(loggerMiddleware);
app.use(cors());

// Temporary store for game state
export let gameState = {};

// Add Socket.IO reference to all requests so route handlers can call it
app.use((req, res, next) => {
	req.io = io;
	next();
});

// Setup routes
app.get('/', (req, res) => res.redirect('/api-docs'));
app.use('/engineering', engineering);
app.use('/fleet', fleet);
app.use('/starmap', starmap);
app.use('/person', person);
app.use('/event', event);
app.use('/post', post);
app.use('/vote', vote);
app.use('/log', log);
app.use('/science', science);
app.get('/state', (req, res) => res.json(gameState));
app.put('/state', setStateRouteHandler);
app.use('/infoboard', infoboard);

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

// Get Empty Epsilon game state and emit it to clients
function getEmptyEpsilonState() {
	// TODO: Validate state and make sure that EE mission did not just change
	getEmptyEpsilonClient().getGameState().then(state => {
		if (state.error) return;
		gameState = state;
		io.emit('gameStateUpdated', state);
	});
}

// Load initial engineering tasks and current events
loadInitialTasks();
loadEvents(io);

const EE_UPDATE_INTERVAL = 1000;
logger.watch(`Starting to poll Empty Epsilon game state every ${EE_UPDATE_INTERVAL}ms`);
setInterval(getEmptyEpsilonState, EE_UPDATE_INTERVAL);

const { APP_PORT } = process.env;
http.listen(APP_PORT, () => logger.start(`Odysseus backend listening to port ${APP_PORT}`));

// Generate and serve API documentation using Swagger at /api-docs
loadSwagger(app);

export { app };
