import { throttle } from 'lodash';
import store from './store';
import { logger } from '../logger';

let previousData;
function sendDataChanges(io) {
	const currentData = store.getState().data;

	for (const type of Object.keys(currentData)) {
		for (const id of Object.keys(currentData[type])) {
			if (!previousData[type] || previousData[type][id] !== currentData[type][id]) {
				io.to(`/data/${type}/${id}`).emit('dataUpdate', type, id, currentData[type][id]);
				io.to(`/data/${type}`).emit('dataUpdate', type, id, currentData[type][id]);
				io.to(`/data`).emit('dataUpdate', type, id, currentData[type][id]);
			}
		}
	}

	for (const type of Object.keys(previousData)) {
		for (const id of Object.keys(previousData[type])) {
			if (!currentData[type] || !currentData[type][id]) {
				io.to(`/data/${type}/${id}`).emit('dataDelete', type, id);
				io.to(`/data/${type}`).emit('dataDelete', type, id);
				io.to(`/data`).emit('dataDelete', type, id);
			}
		}
	}

	previousData = currentData;
}
const throttledSendDataChanges = throttle(sendDataChanges, 100, { leading: false, trailing: true });


export function initStoreSocket(io) {

	// Use /data namespace and 'room' query parameter to subscribe
	const nsp = io.of('/data');
	nsp.on('connection', socket => {
		const room = socket.handshake['query']['data'] || '/data';

		socket.join(room);
		logger.info(`Socket.io listening to data changes for '${room}'`);

		socket.on('disconnect', () => {
			socket.leave(room);
			logger.info(`Socket.io disconnected from '${room}'`);
		});
	});

	previousData = store.getState().data;
	store.subscribe(() => {
		throttledSendDataChanges(nsp);
	});
}
