import { logger } from './logger';
import { Person, Group } from './models/person';
import { ComMessage } from './models/communications';
import { isEmpty, uniqBy, pick } from 'lodash';
import { Router } from 'express';

export const router = new Router();

/**
 * @typedef AdminMessageDetails
 * @property {string} sender.required - Person ID of the sender
 * @property {string} target.required - Person ID of the target
 * @property {string} message.required - Message
 */

/**
 * Get all unread messages
 *
 * @route GET /messaging/unread
 * @group Messaging - Messaging related admin operations
 * @returns {object} 200 - List of all unread messages
 */
router.get('/unread', async (req, res) => {
	const messages = await new ComMessage().where('seen', false).fetchAllWithRelated();
	res.json(messages);
});

/**
 * Send a private message (for admin use)
 *
 * @route POST /messaging/send
 * @group Messaging - Messaging related admin operations
 * @param {AdminMessageDetails.model} messageDetails.body.required - Message details
 * @returns {object} 204 - OK
 */
router.post('/send', async (req, res) => {
	const params = pick(req.body, ['sender', 'target', 'message']);
	const messageDetails = {
		target: params.target,
		type: 'private'
	};
	const mockSocket = {
		emit: () => {},
		userId: params.sender
	};
	await onSendMessage(mockSocket, messageDetails);
	res.sendStatus(204);
});

export function adminSendMessage(userId, messageDetails) {
	const mockSocket = {
		emit: () => {},
		userId
	};
	return onSendMessage(mockSocket, messageDetails);
}

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
	socket.on('message', messageDetails => onSendMessage(socket, messageDetails));
	socket.on('messagesSeen', messageIds => onMessagesSeen(socket, messageIds));
	socket.on('fetchHistory', payload => onFetchHistory(socket, payload));
	socket.on('fetchUnseenMessages', () => onFetchUnseenMessages(socket));
	socket.on('searchUsers', name => onSearchUsers(socket, name));
	socket.on('getUserList', async () => socket.emit(
		'userList', await getInitialUserList(socket.userId)));

	// Emit list of all persons to new client
	socket.emit('userList', await getInitialUserList(socket.userId));

	// Emit all unseen private mesages to new client
	onFetchUnseenMessages(socket);

	// Let all active clients know that user has come online
	messaging.emit('status', { state: 'connected', user: socket.user });

	logger.info(`User ${socket.userId} connected to messaging`);
}

async function onSearchUsers(socket, name) {
	if (!name) return socket.emit('userList', await getInitialUserList(socket.userId));
	const [foundUsers, usersWithMessageHistory] = await Promise.all([
		new Person().search(name),
		getInitialUserList(socket.userId)
	]);
	const users = uniqBy([
		...foundUsers.toArray(),
		...usersWithMessageHistory.toArray()
	], person => person.get('id'));
	users.forEach(person =>
		person.set('is_online', connectedUsers.has(person.get('id'))));
	socket.emit('userList', users);
}

/**
 * Handler for Socket message event to deliver a message
 * @param  {object} socket - Socket
 * @param  {object} messageDetails - Message payload
 */
async function onSendMessage(socket, messageDetails) {
	const { target, message, type } = messageDetails;
	const messageData = {
		person_id: socket.userId,
		message,
		seen: false
	};
	if (type === 'private') {
		messageData.target_person = target;
	} else if (type === 'channel') {
		messageData.target_channel = target;
	} else {
		throw new Error('Invalid message type');
	}

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
 * Handler for Socket messagesSeen event to mark messages as seen
 * @param  {object} socket - Socket
 * @param  {Array.<number>} messageIds - Message ID
 */
async function onMessagesSeen(socket, messageIds) {
	if (isEmpty(messageIds)) return;
	await ComMessage.forge()
		.where('id', 'in', messageIds)
		.save({ seen: true }, { method: 'update', patch: true });
	const messages = await ComMessage.forge().where('id', 'in', messageIds).fetchPageWithRelated();
	socket.emit('messagesSeen', messages);
}

/**
 * Handler for Socket onFetchUnseenMessages events
 * @param  {object} socket - Socket
 */
async function onFetchUnseenMessages(socket) {
	const messages = await ComMessage.forge().where({
		target_person: socket.userId, seen: false
	}).fetchPageWithRelated();
	socket.emit('unseenMessages', messages);
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
async function getInitialUserList(personId) {
	const [users, adminUsers] = await Promise.all([
		Person.query(qb => {
			qb.whereRaw(`id IN (SELECT DISTINCT target_person FROM com_message WHERE person_id = ?) OR id IN (SELECT DISTINCT person_id FROM com_message WHERE target_person = ?)`,
				[personId, personId]);
		}).fetchAll(),
		getAdminUserList()
	]);
	adminUsers.forEach(u => users.add(u));
	users.forEach(person =>
		person.set('is_online', connectedUsers.has(person.get('id'))));
	return users;
}

async function getAdminUserList() {
	const adminGroup = await Group.where({ id: 'role:admin' }).fetch({ withRelated: ['persons'] });
	return adminGroup.related('persons');
}
