import store, { initState } from '../../src/store/store';
import { saveState } from '../../src/store/storePersistance';

console.log('Initializing Redux with empty state');
initState({});

require('./box');
require('./ship');

console.log('Saving the Redux state');
saveState(store.getState().data, 'data').then(() => process.exit());
