// On create, register this box so that
// * config can be fetched
// * registers itself to the rule engine
// On destroy, de-register this box
import { Task } from '../../models/task';

export default class BaseTask {
	constructor({ id, filename, state }) {
		this.id = id;
		this.filename = filename;
		this.masterState = state; // contains reference to all currently loaded boxes
		this.model;
		this.loadTaskDetails();
	}

	async loadTaskDetails() {
		const model = await Task.forge({ id: this.id }).fetch();
		// check for errors
		this.model = model;
	}

	onInit() {
		// update odysseus.task (is_active)
		// box.register(1)
		// box.register(2)
	}

	destroy() {
		// deregister boxes associated
	}

	validate() {
		// validate current state against rules
	}

	// When a task file gets unloaded, make sure we have the latest references
	updateMasterState(state) {
		this.masterState = state;
	}
}
