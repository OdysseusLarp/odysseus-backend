import store from '../../../src/store/store';
import fuseboxes from './fuseboxes';

function save(data) {
    store.dispatch({
        type: 'SET_DATA',
        dataType: data.type,
        dataId: data.id,
        data,
    });
}

fuseboxes.forEach(e => save(e));

