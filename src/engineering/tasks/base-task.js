import { isObject, isBoolean } from 'lodash';
import { Task } from '../../models/task';
import { InvalidParametersError } from '../../errors';

export default class BaseTask {
	constructor({ id, filename }) {
		this.id = id;
		this.filename = filename;
		this.model;
	}

	async getModel() {
		return this.model || await this.loadModel().model;
	}

	async loadModel() {
		const model = await Task.forge({ id: this.id }).fetch();
		// TODO: check for errors
		this.model = model;
		return this;
	}

	async setActive(active) {
		if (!isBoolean(active)) throw new InvalidParametersError('Invalid parameters');
		if (!isObject(this.model)) throw new Error('Model not initialized');
		await this.model.set({ is_active: active }).save();
		return this;
	}

	onInit() {
		// update odysseus.task (is_active)
	}

	destroy() {
		// deregister boxes associated
	}

	validate() {
		// validate current state against rules
	}
}
