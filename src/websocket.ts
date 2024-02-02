import socketIo from 'socket.io';
import { logger } from './logger';
import { Server } from 'http';

let io: socketIo.Server | undefined;

export function initSocketIoClient(http: Server) {
	io = socketIo(http);
	io.on('connection', (socket) => {
		logger.info('Socket.IO Client connected');
		socket.on('disconnect', () => {
			logger.info('Socket.IO Client disconnected');
		});
	});
	return io;
}

export function getSocketIoClient() {
	if (!io) {
		throw new Error('Socket.IO client not initialized');
	}
	return io;
}
