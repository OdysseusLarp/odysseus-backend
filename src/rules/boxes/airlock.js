import { store, watch, getPath } from '../../store/store';
import { CHANNELS, fireEvent } from '../../dmx';
import { logger } from '../../logger';
import { saveBlob, clamp, timeout } from '../helpers';

const airlockNames = ['airlock_main', 'airlock_hangarbay'];

const DEFAULT_CONFIG = {
	transition_times: {},
	dmx_events: {},
};

function now() {
	return new Date().getTime();
}

function Airlock(airlockName) {
	this.name = airlockName;
	this.data = store.getState().data.box[airlockName] || {};
	this.commandCounter = 0;

	watch(['data', 'box', this.name], (data) => {
		this.data = data;
		if (data.command) this.command(data.command);
	});

	if (this.data.status === 'initial') {
		this.patchData({ status: 'closed', pressure: 1.0, countdown_to: 0, command: null });
	} else if (this.data.command) {
		this.command(this.data.command);
	}
}
Airlock.prototype = {
	patchData(changes) {
		logger.debug(`Airlock ${this.name} setting ${JSON.stringify(changes)}`);
		return saveBlob(this.data = Object.assign({}, this.data, changes));
	},

	dmx(eventName) {
		try {
			const config = this.data.config || DEFAULT_CONFIG;
			const event = config.dmx_events[eventName];
			if (event && CHANNELS[event]) fireEvent(CHANNELS[event]);
		} catch (err) {
			logger.warn(`Airlock ${this.name} failed to fire DMX event ${eventName}): ${err}`);
		}
	},

	command(command) {
		if (!command) return;
		this.patchData({ command: null, last_command: command, last_command_at: now() });

		const counter = ++this.commandCounter;  // the increment cancels any current transitions
		logger.debug(`Airlock ${this.name} received command ${counter}: ${command}`);

		const commands = {
			pressurize: ['pressurize'],
			open: ['pressurize', 'openDoor', 'autoClose'],
			depressurize: ['closeDoor', 'depressurize'],
			close: ['closeDoor'],
			stop: ['stopTransition'],  // also used to force status
			malfunction: ['malfunction'],  // mostly for testing
		};
		const sequence = commands[command] || ['unknownCommand'];

		let promise = this.waitUntil(0);
		for (const method of sequence) {
			promise = promise.then(this[method].bind(this));
		}
		promise.then(() => this.commandDone(command, counter))
			.catch(err => this.commandFailed(command, counter, err));
	},
	commandDone(command, counter) {
		logger.info(`Airlock ${this.name} completed command ${counter} (${command})`);
	},
	commandFailed(command, counter, error) {
		if (error === 'cancel') {
			logger.info(`Airlock ${this.name} command ${counter} (${command}) canceled`);
		} else {
			logger.error(`Airlock ${this.name} command ${counter} (${command}) failed: ${error}`);
		}
	},
	waitUntil(time) {
		const start = now(), counter = this.commandCounter;
		return new Promise((resolve, reject) => timeout(() => {
			if (counter === this.commandCounter) resolve();
			else reject('cancel');
		}, Math.max(0, time - start)));
	},

	async unknownCommand() {
		logger.warn(`Airlock ${this.name} ignored unknown command "${this.data.command}"`);
	},

	// transition animations
	async pressurize() {
		const config = this.data.config || DEFAULT_CONFIG;
		const pressure = clamp(this.getPressure() || 0.0, 0, 1);
		if (pressure >= 1) return;  // already pressurized

		const startTime = now();
		const endTime = startTime + config.transition_times.pressurize;
		logger.debug(`Airlock ${this.name} pressurizing from ${startTime} to ${endTime}`);

		this.dmx('pressurize');
		this.patchData({
			status: 'pressurizing',
			countdown_to: endTime,
			pressure: { t0: startTime, p0: pressure, t1: endTime, p1: 1.0 },
		});
		await this.waitUntil(endTime);
		this.patchData({ status: 'closed', countdown_to: 0, pressure: 1.0 });
	},
	async depressurize() {
		const config = this.data.config || DEFAULT_CONFIG;
		const pressure = clamp(this.getPressure() || 0.0, 0, 1);
		if (pressure <= 0) return;  // already depressurized

		const startTime = now();
		const endTime = startTime + config.transition_times.depressurize;
		logger.debug(`Airlock ${this.name} depressurizing from ${startTime} to ${endTime}`);

		this.dmx('depressurize');
		this.patchData({
			status: 'depressurizing',
			countdown_to: endTime,
			pressure: { t0: startTime, p0: pressure, t1: endTime, p1: 0.0 },
		});
		await this.waitUntil(endTime);
		this.patchData({ status: 'vacuum', countdown_to: 0, pressure: 0.0 });
	},
	async openDoor() {
		const config = this.data.config || DEFAULT_CONFIG, status = this.data.status;
		if (status === 'open') return;  // already open
		if (this.isBroken()) return await this.malfunction();

		const startTime = now();
		const endTime = startTime + config.transition_times.open;
		logger.debug(`Airlock ${this.name} opening from ${startTime} to ${endTime}`);

		this.dmx('open');
		this.patchData({ status: 'opening', countdown_to: endTime, pressure: 1.0 });
		await this.waitUntil(endTime);
		this.patchData({ status: 'open', countdown_to: 0, pressure: 1.0 });
	},
	async autoClose() {
		const config = this.data.config || DEFAULT_CONFIG, status = this.data.status;
		if (status !== 'open' || !(config.auto_close_delay > 0)) return;

		const autoCloseTime = now() + config.auto_close_delay;
		const endTime = autoCloseTime + config.transition_times.close;  // for UI countdown
		logger.debug(`Airlock ${this.name} automatically closing at ${autoCloseTime}`);

		this.patchData({ status: 'open', countdown_to: endTime, pressure: 1.0 });
		await this.waitUntil(autoCloseTime);
		return await this.closeDoor();
	},
	async closeDoor() {
		const config = this.data.config || DEFAULT_CONFIG, status = this.data.status;
		if (status !== 'open') return;  // not open?!

		const startTime = now();
		const endTime = startTime + config.transition_times.close;
		logger.debug(`Airlock ${this.name} closing from ${startTime} to ${endTime}`);

		this.dmx('close');
		this.patchData({ status: 'closing', countdown_to: endTime, pressure: 1.0 });
		await this.waitUntil(endTime);
		this.patchData({ status: 'closed', countdown_to: 0, pressure: 1.0 });
	},
	async malfunction() {
		const config = this.data.config || DEFAULT_CONFIG;

		const startTime = now();
		const endTime = startTime + config.transition_times.malfunction;
		logger.debug(`Airlock ${this.name} malfunction from ${startTime} to ${endTime}`);

		this.dmx('malfunction');
		this.patchData({ status: 'malfunction', countdown_to: 0, pressure: 1.0 });
		await this.waitUntil(endTime);
		this.patchData({ status: 'closed', countdown_to: 0, pressure: 1.0 });
	},
	async stopTransition() {
		const status = this.data.status;
		if (status === 'opening' || status === 'pressurizing' || status === 'depressurizing') {
			this.patchData({ status: 'closed', countdown_to: 0, pressure: this.getPressure() });
		} else if (status === 'closing') {
			this.patchData({ status: 'open', countdown_to: 0, pressure: 1.0 });
		} else if (status === 'vacuum') {
			this.patchData({ status: 'vacuum', countdown_to: 0, pressure: 0.0 });
		} else {
			this.patchData({ status, countdown_to: 0, pressure: 1.0 });
		}
	},

	// convert linear pressure ramp back to a numeric pressure value
	getPressure() {
		const pressure = this.data.pressure || 0;
		if (typeof pressure === 'number') return pressure;

		const t = now();
		if (t <= pressure.t0) return pressure.p0;
		if (t >= pressure.t1) return pressure.p1;

		const x = (t - pressure.t0) / (pressure.t1 - pressure.t0);
		return pressure.p0 + x * (pressure.p1 - pressure.p0);
	},

	// is the linked task box broken?
	isBroken() {
		const config = this.data.config || DEFAULT_CONFIG;
		const type = config.linked_task_type || 'box', id = config.linked_task_id;
		if (!id) return false;
		return getPath(['data', type, id, 'status']) === 'broken';
	},
};

// initialize airlock objects
const airlocks = {};
airlockNames.forEach(name => {
	airlocks[name] = new Airlock(name);
});
