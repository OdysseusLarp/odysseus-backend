import { throttle } from 'lodash';
import store from './store';

const MAX_LEVELS = 3;

let previousState;
function sendChanges(io) {
    const currentState = store.getState();
    sendChangesRecursive(io, previousState, currentState, '/store', 0);
    previousState = currentState;
}
const throttledSendChanges = throttle(sendChanges, 10, { leading: false, trailing: true });


function sendChangesRecursive(io, previous, current, prefix, level) {
    if (previous !== current) {
        // console.log("Firing socket.io to " + prefix + " with content: ", current);
        io.of(prefix).emit('storeChange', prefix, current);
        
        if (level < MAX_LEVELS) {
            const currentKeys = Object.keys(current);
            const previousKeys = Object.keys(previous);
            currentKeys.forEach((key) => sendChangesRecursive(io, previous[key] || {}, current[key], prefix + '/' + key, level+1));

            const removedKeys = previousKeys.filter((e) => currentKeys.indexOf(e) < 0);
            removedKeys.forEach((key) => sendChangesRecursive(io, previous[key], {}, prefix + '/' + key, level+1));
        }
    }
}

export function initStoreSocket(io) {
    previousState = store.getState();
    store.subscribe(() => {
        throttledSendChanges(io);
    });
}
