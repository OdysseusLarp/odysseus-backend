require('dotenv').config({ silent: true });
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
import logger from 'signale';
import { get } from 'lodash';
import EmptyEpsilonClient from './emptyepsilon';

const emptyEpsilon = new EmptyEpsilonClient();

// Setup logging middleware
app.use((req, res, next) => {
	logger.log(req.ip, req.method, req.url);
	next();
});

// Temporary store for game state
let state = {};

app.get('/', (req, res) => res.send('Hello'));
app.get('/state', (req, res) => res.json(state));
app.get('/state/:command/:target/:value', (req, res) => {
	const { command, target, value } = req.params;
	emptyEpsilon.setGameState(command, target, value)
		.then(() => res.status(200).send('ok'))
		.catch(error => {
			logger.error('Error setting game state', error);
			res.status(500).send('error');
		});
});

// Setup Socket.IO
io.on('connection', socket => {
	logger.info('Client connected');
	socket.on('disconnect', () => {
		logger.info('Client disconnected');
	});
});

const { APP_PORT } = process.env;
http.listen(APP_PORT, () => logger.start(`Odysseus backend listening to port ${APP_PORT}`));

// Get Empty Epsilon game state and emit it to clients
const EE_UPDATE_INTERVAL = 1000;
let isEmptyEpsilonConnectionHealthy;
logger.watch(`Starting to poll Empty Epsilon game state every ${EE_UPDATE_INTERVAL}ms`);
setInterval(() => {
	// TODO: Validate state and make sure that EE mission did not just change
	emptyEpsilon.getGameState()
		.then(state => {
			if (state.error) return;
			io.emit('gameStateUpdated', state);
			logger.info('Empty Epsilon game state updated');
		});
}, EE_UPDATE_INTERVAL);
