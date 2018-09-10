require('dotenv').config({ silent: true });
const app = require('express')();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);
import { logger, loggerMiddleware } from './logger'
import { getEmptyEpsilonClient } from './emptyepsilon';

import engineering from './routes/engineering';
import fleet from './routes/fleet';
import starmap from './routes/starmap';

// Setup logging middleware and body parsing
app.use(bodyParser.json());
app.use(loggerMiddleware);

// Temporary store for game state
let gameState = {};

// Add Socket.IO reference to all requests so route handlers can call it
app.use((req, res, next) => {
	req.io = io;
	next();
});

// Setup routes
app.get('/', (req, res) => res.send('Odysseus backend'));
app.use('/engineering', engineering);
app.use('/fleet', fleet);
app.use('/starmap', starmap);
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

const EE_UPDATE_INTERVAL = 1000;
logger.watch(`Starting to poll Empty Epsilon game state every ${EE_UPDATE_INTERVAL}ms`);
setInterval(getEmptyEpsilonState, EE_UPDATE_INTERVAL);

const { APP_PORT } = process.env;
http.listen(APP_PORT, () => logger.start(`Odysseus backend listening to port ${APP_PORT}`));
