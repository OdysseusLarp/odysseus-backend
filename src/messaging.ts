import { logger } from './logger';
import { Person, Group } from './models/person';
import { ComMessage } from './models/communications';
import { isEmpty, uniqBy } from 'lodash';
import { Router } from 'express';
import socketIo from 'socket.io';
import { handleAsyncErrors } from './routes/helpers';
import { z } from 'zod';

export const router = Router();

interface UserDetails {
	user: any;
	userId: string;
}

let messaging: socketIo.Namespace;
const connectedUsers = new Map<string, Set<socketIo.Socket>>();
const socketUserDetails = new WeakMap<socketIo.Socket, UserDetails>();

const createAdminMockSocket = (senderUserId: string) => {
	const mockSocket = {
		emit: () => {},
		userId: senderUserId
	} as any;

	socketUserDetails.set(mockSocket, { user: { id: senderUserId }, userId: senderUserId });

	return mockSocket;
}

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
router.get('/unread', handleAsyncErrors(async (req, res) => {
	const messages = await new ComMessage().where('seen', false).fetchAllWithRelated();
	res.json(messages);
}));

const SendMessageRequest = z.object({
	sender: z.string(),
	target: z.string(),
	message: z.string()
});

/**
 * Send a private message (for admin use)
 *
 * @route POST /messaging/send
 * @group Messaging - Messaging related admin operations
 * @param {AdminMessageDetails.model} messageDetails.body.required - Message details
 * @returns {object} 204 - OK
 */
router.post('/send', handleAsyncErrors(async (req, res) => {
	const messageDetails = {
		...SendMessageRequest.parse(req.body),
		type: 'private'
	};
	await onSendMessage(createAdminMockSocket(messageDetails.sender), messageDetails);
	res.sendStatus(204);
}));

export function adminSendMessage(userId: string, messageDetails: any) {
	return onSendMessage(createAdminMockSocket(userId), messageDetails);
}

/**
 * Initializes messaging
 * @param  {object} io - Socket IO instance attached to Express
 */
export function loadMessaging(io: socketIo.Server) {
	// Create custom Socket.IO namespace for messaging
	messaging = io.of('/messaging');

	// Middleware to fetch and attach user model to Socket on handshake
	messaging.use(async (socket, next) => {
		const { id } = socket.handshake.query;
		const user = await Person.forge({ id }).fetch();
		if (!user) return next(new Error('Invalid user'));
		socketUserDetails.set(socket, { user, userId: user.get('id') });
		return next();
	});

	// Handler for new connections
	messaging.on('connection', onConnection);
}

/**
 * Handler for new Socket connections
 * @param  {object} socket - Socket
 */
async function onConnection(socket: socketIo.Socket) {
	const userDetails = socketUserDetails.get(socket);
	if (!userDetails) {
		logger.warn('User details not found for socket');
		return;
	}
	const { user, userId } = userDetails;

	// Add user to list of active sockets for private messaging
	const userSet = connectedUsers.get(userId) || new Set([]);
	userSet.add(socket);
	connectedUsers.set(userId, userSet);

	socket.on('disconnect', () => onUserDisconnect(socket));
	socket.on('message', messageDetails => onSendMessage(socket, messageDetails));
	socket.on('messagesSeen', messageIds => onMessagesSeen(socket, messageIds));
	socket.on('fetchHistory', payload => onFetchHistory(socket, payload));
	socket.on('fetchUnseenMessages', () => onFetchUnseenMessages(socket));
	socket.on('searchUsers', name => onSearchUsers(socket, name));
	socket.on('getUserList', async () => socket.emit(
		'userList', await getInitialUserList(userId)));

	// Emit list of all persons to new client
	socket.emit('userList', await getInitialUserList(userId));

	// Emit all unseen private mesages to new client
	onFetchUnseenMessages(socket);

	// Let all active clients know that user has come online
	messaging.emit('status', { state: 'connected', user });

	logger.info(`User ${userId} connected to messaging`);
}

async function onSearchUsers(socket: socketIo.Socket, name: string) {
	const userDetails = socketUserDetails.get(socket);
	if (!userDetails) {
		logger.warn('User details not found for socket');
		return;
	}
	const { userId } = userDetails;

	if (!name) {
		return socket.emit('userList', await getInitialUserList(userId));
	}

	const [foundUsers, usersWithMessageHistory] = await Promise.all([
		new Person().search(name),
		getInitialUserList(userId)
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
async function onSendMessage(socket: socketIo.Socket, messageDetails: any) {
	const userDetails = socketUserDetails.get(socket);
	if (!userDetails) {
		logger.warn('User details not found for socket');
		return;
	}
	const { userId } = userDetails;

	const { target, message, type } = messageDetails;
	const messageData: Record<string, any> = {
		person_id: userId,
		message,
		seen: false
	};
	if (target === userId) {
		return logger.warn(`${target} tried to message themself, returning`);
	}
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
		const receiverSocketSet = connectedUsers.get(target);
		if (receiverSocketSet) receiverSocketSet.forEach(s => s.emit('message', msgWithRelated));
		const senderSocketSet = connectedUsers.get(userId);
		if (senderSocketSet) senderSocketSet.forEach(s => s.emit('message', msgWithRelated));
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
async function onMessagesSeen(socket: socketIo.Socket, messageIds: number[]) {
	if (isEmpty(messageIds)) return;
	const userDetails = socketUserDetails.get(socket);
	if (!userDetails) {
		logger.warn('User details not found for socket');
		return;
	}

	await ComMessage.forge()
		.where('id', 'in', messageIds)
		.save({ seen: true }, { method: 'update', patch: true });
	const messages = await ComMessage.forge().where('id', 'in', messageIds).fetchPageWithRelated();
	const socketSet = connectedUsers.get(userDetails.userId);
	if (socketSet) socketSet.forEach(s => s.emit('messagesSeen', messages));
}

/**
 * Handler for Socket onFetchUnseenMessages events
 * @param  {object} socket - Socket
 */
async function onFetchUnseenMessages(socket: socketIo.Socket) {
	const userDetails = socketUserDetails.get(socket);
	if (!userDetails) {
		logger.warn('User details not found for socket');
		return;
	}

	const messages = await ComMessage.forge().where({
		target_person: userDetails.userId, seen: false
	}).fetchPageWithRelated();
	socket.emit('unseenMessages', messages);
}

/**
 * Handler for Socket fetchHistory events
 * @param  {object} socket - Socket
 * @param  {object} payload - Request payload
 */
async function onFetchHistory(socket: socketIo.Socket, payload: any) {
	const { type, target } = payload;
	const userDetails = socketUserDetails.get(socket);
	if (!userDetails) {
		logger.warn('User details not found for socket');
		return;
	}

	let messages;
	// TODO: Add support for pagination instead of only 50 latest
	if (type === 'private') {
		messages = await ComMessage.forge().getPrivateHistory(userDetails.userId, target);
	} else {
		messages = await ComMessage.forge().getChannelHistory(target);
	}
	socket.emit('latestMessages', { type, target, messages });
}

/**
 * Handler for Socket disconnect event
 * @param  {object} socket - Socket
 */
function onUserDisconnect(socket: socketIo.Socket) {
	const userDetails = socketUserDetails.get(socket);
	if (!userDetails) {
		logger.warn('User details not found for socket');
		return;
	}
	const { user, userId } = userDetails;

	messaging.emit('status', { state: 'disconnected', user });
	const userSet = connectedUsers.get(userId);
	if (userSet) userSet.delete(socket);
	if (userSet && !userSet.size) connectedUsers.delete(userId);
	logger.info(`User ${userId} disconnected from messaging`);
}

/**
 * Gets a list of all Persons. Adds 'is_online' attribute to models.
 * @returns {Array.<Person>} List of persons
 */
async function getInitialUserList(personId: string) {
	const [users, adminUsers] = await Promise.all([
		Person.query(qb => {
			// eslint-disable-next-line max-len
			qb.whereRaw(`id IN (SELECT DISTINCT target_person FROM com_message WHERE person_id = ?) OR id IN (SELECT DISTINCT person_id FROM com_message WHERE target_person = ?)`,
				[personId, personId]);
			qb.groupBy('id');
		}).fetchAll(),
		getAdminUserList()
	]);

	// Make sure that admin users are not added as duplicates
	const userIds = new Set(users.map((user) => user.id));
	adminUsers.forEach((user) => {
		if (!userIds.has(user.id)) {
			users.push(user);
		}
	});
	users.forEach(person =>
		person.set('is_online', connectedUsers.has(person.get('id'))));
	return users;
}

async function getAdminUserList() {
	const adminGroup = await Group.where({ id: 'role:admin' }).fetch({ withRelated: ['persons'] });
	return adminGroup.related('persons');
}
