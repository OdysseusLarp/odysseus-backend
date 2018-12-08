import { logger } from './logger';
import { Person } from './models/person';
import { ComMessage } from './models/communications';

let messaging;
const connectedUsers = new Map();

/**
 * Initializes messaging
 * @param  {object} io - Socket IO instance attached to Express
 */
export function loadMessaging(io) {
	// Create custom Socket.IO namespace for messaging
	messaging = io.of('/messaging');

	// Middleware to fetch and attach user model to Socket on handshake
	messaging.use(async (socket, next) => {
		const { id } = socket.handshake.query;
		const user = await Person.forge({ id }).fetch();
		if (!user) return next(new Error('Invalid user'));
		socket.user = user;
		socket.userId = user.get('id');
		return next();
	});

	// Handler for new connections
	messaging.on('connection', onConnection);
}

/**
 * Handler for new Socket connections
 * @param  {object} socket - Socket
 */
async function onConnection(socket) {
	// Add user to list of active sockets for easier private messaging
	// TODO: Check if user already has an active socket and disconnect that one first
	connectedUsers.set(socket.userId, socket);

	socket.on('disconnect', () => onUserDisconnect(socket));
	socket.on('message', payload => onSendMessage(socket, payload));
	socket.on('fetchHistory', payload => onFetchHistory(socket, payload));

	// Emit list of all persons to new client
	socket.emit('userList', await getUserList());

	// Emit list of previous messages to new client
	// socket.emit('latestMessages', await getLatestMessages());

	// Let all active clients know that user has come online
	messaging.emit('status', { state: 'connected', user: socket.user });

	logger.info(`User ${socket.userId} connected to messaging`);
}

/**
 * Handler for Socket message event
 * @param  {object} socket - Socket
 * @param  {object} payload - Message payload
 */
async function onSendMessage(socket, payload) {
	const { target, message, type } = payload;
	const messageData = {
		person_id: socket.userId,
		message
	};
	if (type === 'private') {
		messageData.target_person = target;
	} else if (type === 'channel') {
		messageData.target_channel = target;
	} else {
		throw new Error('Invalid message type');
	}

	logger.debug(`Message from user ${socket.userId}: ${JSON.stringify(payload)}`);

	// TODO: add 'message_seen' attribute and functionality
	const msg = await ComMessage.forge().save(messageData, { method: 'insert' });

	// Only emit to target and sender client if message is private
	if (type === 'private' && connectedUsers.has(target)) {
		const msgWithRelated = await msg.fetchWithRelated();
		connectedUsers.get(target).emit('message', msgWithRelated);
		socket.emit('message', msgWithRelated);
	} else {
		// Send to general channel for now
		messaging.emit('message', await msg.fetchWithRelated());
	}
}

/**
 * Handler for Socket fetchHistory events
 * @param  {object} socket - Socket
 * @param  {object} payload - Request payload
 */
async function onFetchHistory(socket, payload) {
	const { type, target } = payload;
	let messages;
	// TODO: Add support for pagination instead of only 50 latest
	if (type === 'private') {
		messages = await ComMessage.forge().getPrivateHistory(socket.userId, target);
	} else {
		messages = await ComMessage.forge().getChannelHistory(target);
	}
	socket.emit('latestMessages', { type, target, messages });
}

/**
 * Handler for Socket disconnect event
 * @param  {object} socket - Socket
 */
function onUserDisconnect(socket) {
	messaging.emit('status', { state: 'disconnected', user: socket.user });
	connectedUsers.delete(socket.userId);
	logger.info(`User ${socket.userId} disconnected from messaging`);
}

/**
 * Gets a list of all Persons. Adds 'is_online' attribute to models.
 * @returns {Array.<Person>} List of persons
 */
async function getUserList() {
	const users = await Person.forge().fetchAll();
	users.forEach(person =>
		person.set('is_online', connectedUsers.has(person.get('id'))));
	return users;
}
