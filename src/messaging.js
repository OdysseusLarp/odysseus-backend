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

	// Emit list of all persons to new client
	socket.emit('userList', await getUserList());

	// Emit list of previous messages to new client
	socket.emit('latestMessages', await getLatestMessages());

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
	const { target, message } = payload;
	// const outgoingMessage = {
	// 	user: getSocketUser(socket),
	// 	message,
	// 	timestamp: Date.now()
	// };
	logger.debug(`Message from user ${socket.userId}: ${JSON.stringify(payload)}`);

	// TODO: add 'message_seen' attribute and functionality

	// Private messaging
	if (target && connectedUsers.get(target)) {
		// const msg = { ...outgoingMessage, context: 'private', to: target };
		// connectedUsers.get(target).emit('message', msg);
		// messaging.emit('message', msg);
	} else {
		// Send to general channel for now
		const msg = await ComMessage.forge().save({
			person_id: socket.userId,
			target_channel: 'general',
			message
		}, { method: 'insert' });
		messaging.emit('message', await msg.fetchWithRelated());
	}
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

// TODO: Support different pages, channels and private messages

/**
 * Gets a list of previous messages.
 * @returns {Array.<ComMessage>} List of previous messages
 */
async function getLatestMessages() {
	const messages = await ComMessage.forge().fetchPageWithRelated(1);
	return messages;
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
