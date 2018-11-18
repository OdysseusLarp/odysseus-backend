require('dotenv').config({ silent: true });
const app = require('express')();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cors = require('cors');
import { logger, loggerMiddleware } from './logger';
import { loadSwagger } from './docs';
import { getEmptyEpsilonClient } from './emptyepsilon';
import { loadInitialTasks } from './engineering/tasks';

import engineering from './routes/engineering';
import fleet from './routes/fleet';
import starmap from './routes/starmap';
import person from './routes/person';
import event from './routes/event';

// Setup logging middleware and body parsing
app.use(bodyParser.json());
app.use(loggerMiddleware);

// Allow CORS from all origins for now
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
app.get('/state', (req, res) => res.json(gameState));
app.put('/state', (req, res) => {
	const { command, target, value } = req.body;
	getEmptyEpsilonClient().setGameState(command, target, value)
		.then(() => res.sendStatus(204))
		.catch(error => {
			logger.error('Error setting game state', error);
			res.sendStatus(500);
		});
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

// Get Empty Epsilon game state and emit it to clients
function getEmptyEpsilonState() {
	// TODO: Validate state and make sure that EE mission did not just change
	getEmptyEpsilonClient().getGameState().then(state => {
		if (state.error) return;
		gameState = state;
		io.emit('gameStateUpdated', state);
	});
}

// Load initial engineering tasks
loadInitialTasks();

const EE_UPDATE_INTERVAL = 1000;
logger.watch(`Starting to poll Empty Epsilon game state every ${EE_UPDATE_INTERVAL}ms`);
setInterval(getEmptyEpsilonState, EE_UPDATE_INTERVAL);

const { APP_PORT } = process.env;
http.listen(APP_PORT, () => logger.start(`Odysseus backend listening to port ${APP_PORT}`));

// Generate and serve API documentation using Swagger at /api-docs
loadSwagger(app);

export { app };
