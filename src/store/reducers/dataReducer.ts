import { createReducer } from 'redux-starter-kit';

const initialState: Record<string, unknown> = {};

const dataReducer = createReducer(initialState, {
	SET_DATA: (state, action) => {
		const id = action.dataId;
		const type = action.dataType;

		state[type] = state[type] || {};
		const oldData = state[type][id] || {};
		const newData = { ...action.data };

		newData.id = id;
		newData.type = type;
		newData.updated_at = Date.now();
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
	OVERWRITE_STATE: (state, action) => ({ ...action.state })
});

export default dataReducer;
