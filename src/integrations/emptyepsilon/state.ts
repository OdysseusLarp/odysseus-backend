import { getData, setData } from '@/routes/data';
import { getEmptyEpsilonClient } from './client';
import { get, isEqual, omit } from 'lodash';

// Get latest Empty Epsilon game state and save it to store
export function updateEmptyEpsilonState(): Promise<void> {
	// Exit straight away if EE connection is disabled. It needs to be disabled before
	// the EE server is launched, because the EE HTTP server is buggy and will crash the
	// game server if it gets a request before fully loading.
	const isEeConnectionEnabled = !!get(getData('ship', 'metadata'), 'ee_connection_enabled');
	if (!isEeConnectionEnabled) return;

	return getEmptyEpsilonClient()
		.getGameState()
		.then(state => {
			const metadataKeys = ['id', 'type', 'created_at', 'updated_at', 'version'];
			// Save Empty Epsilon connection status to EE metadata blob
			const connectionStatus = getEmptyEpsilonClient().getConnectionStatus();
			const previousConnectionStatus = omit(getData('ship', 'ee_metadata'), metadataKeys);
			if (!isEqual(connectionStatus, previousConnectionStatus)) setData('ship', 'ee_metadata', connectionStatus, true);
			// Do not update state if request to EE failed
			if ('error' in state) return;
			// Do not update state if EE sync is disabled
			if (!get(getData('ship', 'metadata'), 'ee_sync_enabled')) return;
			const currentState = omit(getData('ship', 'ee'), metadataKeys);
			// Do not update state if state has not changed
			if (isEqual(state, currentState)) return;
			setData('ship', 'ee', state, true);
		});
}
