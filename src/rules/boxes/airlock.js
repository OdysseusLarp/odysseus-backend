import { store, watch } from '@/store/store';
import { CHANNELS, fireEvent } from '@/dmx';
import { logger } from '@/logger';
import { saveBlob, clamp, timeout } from '../helpers';

const airlockNames = ['airlock_main', 'airlock_hangarbay'];

const DEFAULT_CONFIG = {
	dmx_events: {},
};

const DEFAULT_TRANSITION_TIMES = {
	open: 6500,
	close: 5000,
	pressurize: 73000,
	depressurize: 601000,
	evacuate: 42000,
};

function now() {
	return new Date().getTime();
}

const JUMP_INITIATED = 'jump_initiated';
const JUMPING = 'jumping';

function Airlock(airlockName) {
	this.name = airlockName;
	this.data = store.getState().data.box[airlockName] || {};
	this.commandCounter = 0;
	this.closeBeforeJumpTimeout = null;

	watch(['data', 'box', this.name], (data) => {
		this.data = data;
		if (data?.command) this.command(data.command);
	});

	watch(['data', 'ship', 'jump'], (current, previous) => {
		// Issue an automatic command to close the airlocks a configurable amount of time after a jump is initiated:
		if (current.status !== JUMP_INITIATED) {
			if (this.closeBeforeJumpTimeout) clearTimeout(this.closeBeforeJumpTimeout);
			this.closeBeforeJumpTimeout = null;
		} else if (previous.status !== JUMP_INITIATED) {
			const delay = this.data.config.jump_close_delay || 0;
			this.closeBeforeJumpTimeout ||= setTimeout(() => this.closeForJump(), delay);
		}
	});

	watch(['data', 'ship', 'jumpstate'], (current, previous) => {
		// Stop transitions and reset the airlock to a known (closed and pressurized) state on jump:
		if (current.status === JUMPING && previous.status !== JUMPING) {
			this.patchData({ status: 'closed', pressure: 1.0, command: 'stop' })
		}
	});

	if (this.data.status === 'initial') {
		this.patchData({ status: 'closed', pressure: 1.0, countdown_to: 0, command: null, access_denied: false });
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
			depressurize: ['closeDoor', 'depressurize', 'autoPressurize'],
			forceDepressurize: ['denyAccess', 'closeDoor', 'depressurize', 'autoPressurize', 'allowAccess'],
			evacuate: ['closeDoor', 'evacuate', 'autoPressurize'], // faster depressurize for jettisoning objects
			close: ['closeDoor'],
			stop: ['stopTransition'],  // also used to force status
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
	transitionTime(transition) {
		const transition_times = this.data?.config?.transition_times || {};
		return transition_times[transition] || DEFAULT_TRANSITION_TIMES[transition] || 0;
	},

	async unknownCommand() {
		logger.warn(`Airlock ${this.name} ignored unknown command "${this.data.command}"`);
	},

	// Trigger an automatic close command before jumping, unless the door is already closed or closing:
	closeForJump() {
		const status = this.data.status;
		if (status !== 'closed' && status !== 'closing') {
			this.command('close');
		}
	},

	// transition animations
	async pressurize() {
		const pressure = clamp(this.getPressure() || 0.0, 0, 1);
		if (pressure >= 1) return;  // already pressurized

		const startTime = now();
		const endTime = startTime + this.transitionTime('pressurize');
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
		return await this.depressurizeImpl('depressurize');
	},
	async evacuate() {
		return await this.depressurizeImpl('evacuate');
	},
	async depressurizeImpl(mode) {
		const pressure = clamp(this.getPressure() || 0.0, 0, 1);
		if (pressure <= 0) return;  // already depressurized

		const startTime = now();
		const endTime = startTime + this.transitionTime(mode);
		logger.debug(`Airlock ${this.name} depressurizing from ${startTime} to ${endTime} (mode: ${mode})`);

		this.dmx(mode);
		this.patchData({
			status: 'depressurizing',
			countdown_to: endTime,
			pressure: { t0: startTime, p0: pressure, t1: endTime, p1: 0.0 },
		});
		await this.waitUntil(endTime);
		this.patchData({ status: 'vacuum', countdown_to: 0, pressure: 0.0 });
	},
	async openDoor() {
		const status = this.data.status;
		if (status === 'open') return;  // already open

		const startTime = now();
		const endTime = startTime + this.transitionTime('open');
		logger.debug(`Airlock ${this.name} opening from ${startTime} to ${endTime}`);

		this.dmx('open');
		this.patchData({ status: 'opening', countdown_to: endTime, pressure: 1.0 });
		await this.waitUntil(endTime);
		this.patchData({ status: 'open', countdown_to: 0, pressure: 1.0 });
	},
	async closeDoor() {
		const status = this.data.status;
		if (status === 'closed') return;  // already closed

		const startTime = now();
		const endTime = startTime + this.transitionTime('close');
		logger.debug(`Airlock ${this.name} closing from ${startTime} to ${endTime}`);

		// This method may be called when jumping even if the airlock is fully or partially depressurized.
		// In that case we stop any pressure change in progress but leave the pressure at its current value.
		// A "stop" command will be automatically issued on successful jump, resetting the pressure to 1.0.
		const pressure = clamp(this.getPressure() || 0.0, 0, 1);

		this.dmx('close');
		this.patchData({ status: 'closing', countdown_to: endTime, pressure: pressure });
		await this.waitUntil(endTime);
		this.patchData({ status: 'closed', countdown_to: 0, pressure: pressure });
	},
	async autoClose() {
		const config = this.data.config || DEFAULT_CONFIG, status = this.data.status;
		if (status !== 'open' || !(config.auto_close_delay > 0)) return;

		const autoCloseTime = now() + config.auto_close_delay;
		const endTime = autoCloseTime + this.transitionTime('close');  // for UI countdown
		logger.debug(`Airlock ${this.name} automatically closing at ${autoCloseTime}`);

		this.patchData({ status: 'open', countdown_to: endTime, pressure: 1.0 });
		await this.waitUntil(autoCloseTime);
		return await this.closeDoor();
	},
	async autoPressurize() {
		const config = this.data.config || DEFAULT_CONFIG, status = this.data.status;
		if (status !== 'vacuum' || !(config.auto_pressurize_delay > 0)) return;

		const autoPressurizeTime = now() + config.auto_pressurize_delay;
		const endTime = autoPressurizeTime + this.transitionTime('pressurize');  // for UI countdown
		logger.debug(`Airlock ${this.name} automatically pressurizing at ${autoPressurizeTime}`);

		this.patchData({ status: 'vacuum', countdown_to: endTime, pressure: 0.0 });
		await this.waitUntil(autoPressurizeTime);
		return await this.pressurize();
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
	// Helper methods to disable and enable all airlocks for Tristan Fukui's scene:
	async denyAccess() {
		for (const name of airlockNames) {
			airlocks[name].patchData({ access_denied: true });
		}
	},
	async allowAccess() {
		for (const name of airlockNames) {
			airlocks[name].patchData({ access_denied: false });
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
};

// initialize airlock objects
const airlocks = {};
airlockNames.forEach(name => {
	airlocks[name] = new Airlock(name);
});
