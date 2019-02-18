import store from '../store/store'
import httpErrors from 'http-errors';

import { Router } from 'express';
const router = new Router();


function getData(dataType, dataId) {
	const state = store.getState().data;
	if (state[dataType] && state[dataType][dataId]) {
		return state[dataType][dataId];
	} else {
		return {};
	}
}

function setData(dataType, dataId, data, force = false) {
	if (!force) {
		const oldData = getData(dataType, dataId);
		if (oldData.version && oldData.version !== data.version) {
			throw new httpErrors.Conflict(`Wrong version number, provided '${data.version}', expected '${oldData.version}'`);
		}
	}

	store.dispatch({
		type: 'SET_DATA',
		dataType,
		dataId,
		data,
	});
}

function deleteData(dataType, dataId) {
	store.dispatch({
		type: 'DELETE_DATA',
		dataType,
		dataId,
	})
}

/**
 * Get all data blobs of all types.
 *
 * @route GET /data
 * @group Data - Generic data store operations
 * @returns {Object} 200 - Array of all data blobs
 */
router.get('/', (req, res) => {
	const state = store.getState().data;
	const datas = Object.values(state).flatMap(e => Object.values(e));
	res.json(datas);
});


/**
 * Get all data blogs by type.
 *
 * @route GET /data/{type}
 * @group Data - Generic data store operations
 * @param {string} type.path.required - Data type
 * @returns {Object} 200 - Array of data blobs
 */
router.get('/:type', (req, res) => {
	const { type } = req.params;
	const state = store.getState().data;
	const datas = state[type] || {};
	res.json(Object.values(datas));
});


/**
 * Get a specific data blob by type and id.
 *
 * @route GET /data/{type}/{id}
 * @group Data - Generic data store operations
 * @param {string} id.path.required - Data id
 * @param {string} type.path.required - Data type
 * @returns {Object} 200 - Data value
 */
router.get('/:type/:id', (req, res) => {
	const { type, id } = req.params;
	return res.json(getData(type, id));
});


/**
 * Set a specific data blob by type and id. Overwrites entire data.
 *
 * Returns 409 if version is incorrect and force not used.
 *
 * @route POST /data/{type}/{id}
 * @consumes application/json
 * @group Data - Generic data store operations
 * @param {string} id.path.required - Data id
 * @param {string} type.path.required - Data type
 * @param {Object} any.body.required - New data value
 * @param {boolean} force.query - Force value to be set regardless of version
 * @returns {Object} 200 - Updated data value
 * @returns {Error}  409 - Error if submitted version is different that current version
 */
router.post('/:type/:id', (req, res) => {
	const { type, id } = req.params;
	const { force } = req.query;
	const data = req.body;
	setData(type, id, data, force);
	res.json(getData(type, id));
});


/**
 * Update a specific data blob by type and id. Keeps those fields which are not present in payload.
 *
 * Returns 409 if version is incorrect and force not used.
 *
 * @route PATCH /data/{type}/{id}
 * @consumes application/json
 * @group Data - Generic data store operations
 * @param {string} id.path.required - Data id
 * @param {string} type.path.required - Data type
 * @param {Object} any.body.required - Fields to update
 * @param {boolean} force.query - Force value to be set regardless of version
 * @returns {Object} 200 - Updated data value
 * @returns {Error}  409 - Error if submitted version is different that current version
 */
router.patch('/:type/:id', (req, res) => {
	const { type, id } = req.params;
	const { force } = req.query;
	const data = { ...getData(type, id), ...{ version: undefined }, ...req.body };
	setData(type, id, data, force);
	res.json(getData(type, id));
});


/**
 * Delete a specific data blob by type and id.
 *
 * @route DELETE /data/{type}/{id}
 * @group Data - Generic data store operations
 * @param {string} id.path.required - Data id
 * @param {string} type.path.required - Data type
 * @returns {Object} 200 - Updated data value (empty object)
 */
router.delete('/:type/:id', (req, res) => {
	const { type, id } = req.params;
	deleteData(type, id);
	res.json({});
});


export default router;
