import { createReducer } from 'redux-starter-kit';

const dataReducer = createReducer({}, {
	SET_DATA: (state, action) => {
		const id = action.dataId;
		const type = action.dataType;

		state[type] = state[type] || {};
		const oldData = state[type][id] || {};
		const newData = { ...action.data };

		newData.id = id;
		newData.type = type;
		if (oldData.created_at) {
			newData.created_at = oldData.created_at;
		} else {
			newData.created_at = new Date().toISOString();
		}
		newData.updated_at = new Date().toISOString();
		if (typeof oldData.version !== 'number') {
			newData.version = 1;
		} else {
			newData.version = oldData.version + 1;
		}

		state[type][id] = newData;
	},
	DELETE_DATA: (state, action) => {
		const id = action.dataId;
		const type = action.dataType;

		if (state[type]) {
			delete state[type][id];
		}
	},
	OVERWRITE_STATE: (state, action) => {
		return { ...action.state };
	}
});

export default dataReducer;
