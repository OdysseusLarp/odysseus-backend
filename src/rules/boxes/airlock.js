import { store, watch } from '../../store/store';
import { CHANNELS, fireEvent } from '../../dmx';
import { logger } from '../../logger';
import { saveBlob, clamp, timeout } from '../helpers';

const airlockNames = ['airlock_main', 'airlock_hangarbay'];
const pressureUpdateInterval = 250;  // four updates per second

const DEFAULT_CONFIG = {
	pressurize: {
		start_delay: 2000,
		duration: 25000,
		end_delay: 3000,
		malfunction_delay: 2000,
	},
	depressurize: {
		start_delay: 10000,
		duration: 20000,
		end_delay: 0,
	},
	dmx: {
		airlock_open: 'AirlockDoorOpen',
		airlock_close: 'AirlockDoorClose',
	},
};

// klugy work-around for https://redux.js.org/troubleshooting#never-mutate-reducer-arguments
function copy(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function now() {
	return new Date().getTime();
}

function Airlock(airlockName) {
	this.name = airlockName;
	this.data = copy(store.getState().data.box[airlockName] || {});
	this.animation = 0;
	logger.debug(`Airlock ${this.name} initialized`);
}
Airlock.prototype = {
	startWatching() {
		logger.debug(`Airlock ${this.name} watching for status changes`);
		watch(['data', 'box', this.name], (newData) => {
			const statusChanged = (newData.status !== this.data.status);
			this.data = copy(newData);
			if (statusChanged) this.statusChanged(newData.status, this.data.status);
		});
		this.statusChanged(this.data.status, 'initial');
	},
	setStatus(status) {
		const oldStatus = this.data.status;
		this.data.status = status;
		if (status !== oldStatus) this.statusChanged(status, oldStatus);
		// caller is expected to .pushData() after changing the status
	},
	statusChanged(status, previous) {
		logger.debug(`Airlock ${this.name} changed status from ${previous} to ${status}`);
		this.stopAnimation();
		this.data.transition_status = null;

		if (status === 'open') {
			this.dmx('airlock_open');
		} else if (previous === 'open') {
			this.dmx('airlock_close');
		}

		// transitions just launch animations
		if (status === 'pressurizing') {
			return this.runAnimation(this.pressurize()); // skip rest of method
		} else if (status === 'depressurizing') {
			return this.runAnimation(this.depressurize()); // skip rest of method
		} else if (status === 'open') {
			this.data.pressure = 1.0;
		} else if (status === 'vacuum') {
			this.data.pressure = 0.0;
		} else if (status !== 'malfunction' && status !== 'error') {
			logger.warn(`Airlock ${this.name} has unknown status ${status}!`);
			this.setStatus('error');
		}
		this.pushData();
	},
	dmx(eventName) {
		try {
			const event = this.data.config.dmx[eventName];
			if (CHANNELS[event]) fireEvent(CHANNELS[event]);
		} catch (err) {
			logger.warn(`Airlock ${this.name} failed to fire DMX event ${eventName}: ${err}`);
		}
	},

	runAnimation(promise) {
		promise.then(() => logger.debug(`Airlock ${this.name} animation completed`))
			.catch(err => err && logger.warn(`Airlock ${this.name} animation failed: ${err}`));
		logger.debug(`Airlock ${this.name} started animation ${this.animation}`);
	},
	stopAnimation() {
		this.animation++;
	},

	pushData() {
		return saveBlob(copy(this.data));
	},
	async pushAndWaitUntil(time) {
		const t0 = now();
		// logger.debug(`Airlock ${this.name} pushing and waiting for ${time - t0} ms`);
		this.pushData();

		if (t0 >= time) return Promise.resolve();

		const animation = this.animation;
		return new Promise((resolve, reject) => timeout(() => {
			if (animation && this.animation === animation) {
				// logger.debug(`Airlock ${this.name} timeout completed`);
				resolve();
			} else {
				logger.debug(`Airlock ${this.name} timeout aborted: ${animation} != ${this.animation}`);
				reject(null);
			}
		}, time - t0));
	},

	// (de)pressurization animations
	async pressurize() {
		const config = this.data.config || DEFAULT_CONFIG;
		const pressure = clamp(this.data.pressure || 0.0, 0, 1);

		const startTime = now();
		const pumpStart = startTime + (pressure < 1 ? config.pressurize.start_delay || 0 : 0);
		const pumpStop = pumpStart + (1 - pressure) * (config.pressurize.duration || 25000);
		const endTime = pumpStop + (config.pressurize.end_delay || 0);

		logger.debug(`Airlock ${this.name} pressurizing from ${startTime} to ${endTime}`);

		this.data.countdown_to = endTime;

		if (pressure < 1.0) {
			this.data.transition_status = 'pressurize_start';
			await this.pushAndWaitUntil(pumpStart);

			this.data.transition_status = 'pressurize_airflow';
			await this.rampPressure(pressure, 1.0, pumpStop);
		}

		this.data.pressure = 1.0;
		this.data.transition_status = 'pressurize_end';

		if (this.data.malfunction) {
			await this.pushAndWaitUntil(pumpStop + (config.pressurize.malfunction_delay || 0));
			this.setStatus('malfunction');
		} else {
			await this.pushAndWaitUntil(endTime);
			this.setStatus('open');
		}
		this.data.transition_status = null;
		this.data.countdown_to = 0;
		this.pushData();
		logger.debug(`Airlock ${this.name} pressurization complete`);
	},

	async depressurize() {
		const config = this.data.config || DEFAULT_CONFIG;
		const pressure = clamp(this.data.pressure || 0.0, 0, 1);

		const startTime = now();
		const pumpStart = startTime + (pressure > 0 ? config.depressurize.start_delay || 0 : 0);
		const pumpStop = pumpStart + pressure * (config.depressurize.duration || 2500);
		const endTime = pumpStop + (config.depressurize.end_delay || 0);

		logger.debug(`Airlock ${this.name} depressurizing from ${startTime} to ${endTime}`);

		this.data.countdown_to = endTime;

		if (pressure >= 1.0) {
			this.data.transition_status = 'depressurize_start';
			await this.pushAndWaitUntil(pumpStart);
		}
		if (pressure > 0.0) {
			this.data.transition_status = 'depressurize_airflow';
			await this.rampPressure(pressure, 0.0, pumpStop);
		}

		this.data.pressure = 0.0;
		this.data.transition_status = 'depressurize_end';
		await this.pushAndWaitUntil(endTime);

		this.data.countdown_to = 0;
		this.data.transition_status = null;
		this.setStatus('vacuum');
		this.pushData();
		logger.debug(`Airlock ${this.name} depressurization complete`);
	},
	async rampPressure(from, to, until) {
		const t0 = now();
		let t = t0;
		while (t < until) {
			const x = 1 - (until - t) / (until - t0);
			this.data.pressure = from + x * (to - from);
			// logger.debug(`Airlock ${this.name} pressure = ${this.data.pressure}...`)
			await this.pushAndWaitUntil(Math.min(until, t + pressureUpdateInterval));
			t = now();
		}
		this.data.pressure = to;
		// logger.debug(`Airlock ${this.name} pressure = ${this.data.pressure}`)
		this.pushData();
	},
};

// initialize airlock objects
const airlocks = {};
airlockNames.forEach(airlockName => {
	const airlock = new Airlock(airlockName);
	airlocks[airlockName] = airlock;
	airlock.startWatching();
});
