import { isObject, isBoolean } from 'lodash';
import { Task } from '../../models/task';
import { InvalidParametersError } from '../../errors';

export default class BaseTask {
	constructor({ id, filename }) {
		this.id = id;
		this.filename = filename;
		this.model;
		this.loadTaskDetails();
	}

	async loadTaskDetails() {
		const model = await Task.forge({ id: this.id }).fetch();
		// TODO: check for errors
		this.model = model;
	}

	async setActive(active) {
		if (!isBoolean(active)) throw new InvalidParametersError('Invalid parameters');
		if (!isObject(this.model)) throw new Error('Model not initialized');
		await this.model.set({ is_active: active }).save();
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
