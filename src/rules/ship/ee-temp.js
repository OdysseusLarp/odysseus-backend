import { saveBlob, clamp, brownianGenerator, interval } from '../helpers';
import store from '../../store/store';
import { mapValues } from 'lodash';

/*
 * Generate ee_temp data blob with artificial EE temperatures
 */

const TEMPS = {
	reactor: {
		min: 800,
		max: 5700,
	},
	maneuver: {
		min: 400,
		max: 4200,
	},
	impulse: {
		min: 600,
		max: 5100,
	},
	frontshield: {
		min: 600,
		max: 3200,
	},
	rearshield: {
		min: 600,
		max: 3200,
	},
	missilesystem: {
		min: 300,
		max: 2700,
	},
	beamweapons: {
		min: 400,
		max: 5600,
	},
};

const RANDOMS = mapValues(TEMPS, () => brownianGenerator(200));

interval(() => {
	const heats = store.getState().data.ship.ee.systems.heat;
	const blob = { ...(store.getState().data.ship.ee_temp || { type: 'ship', id: 'ee_temp' }) };
	for (const type of Object.keys(TEMPS)) {
		const { min, max } = TEMPS[type];
		const heat = clamp(heats[`${type}Heat`], 0, 1);

		const temp = heat * (max-min) + min + RANDOMS[type].next().value;
		blob[`${type}Temp`] = temp;

		let status;
		if (heat < 0.3) {
			status = 'NOMINAL';
		} else if (heat < 0.9) {
			status = 'HIGH';
		} else {
			status = 'CRITICAL';
		}
		blob[`${type}Status`] = status;
	}
	saveBlob(blob);
}, 1000);
