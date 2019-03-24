import store from '../../src/store/store';

export function saveBlob(data) {
	store.dispatch({
		type: 'SET_DATA',
		dataType: data.type,
		dataId: data.id,
		data,
	});
}
