import { saveBlob, clamp, brownianGenerator, interval } from '../helpers';
import store from '../../store/store';
import { mapValues } from 'lodash';

/*
 * Generate ee_temp data blob with artificial EE temperatures
 */

const TEMPS = {
	reactorHeat: {
		min: 1300,
		max: 9700,
	},
	maneuverHeat: {
		min: 400,
		max: 3200,
	},
	impulseHeat: {
		min: 600,
		max: 4800,
	},
	frontshieldHeat: {
		min: 600,
		max: 4200,
	},
	rearshieldHeat: {
		min: 600,
		max: 4200,
	},
	missilesystemHeat: {
		min: 200,
		max: 1200,
	},
	beamweaponsHeat: {
		min: 400,
		max: 4800,
	},
};

const RANDOMS = mapValues(TEMPS, () => brownianGenerator(200));

interval(() => {
	const heat = store.getState().data.ship.ee.systems.heat;
	const blob = { ...(store.getState().data.ship.ee_temp || { type: 'ship', id: 'ee_temp' }) };
	for (const type of Object.keys(TEMPS)) {
		const { min, max } = TEMPS[type];
		const temp = clamp(heat[type], 0, 1) * (max-min) + min + RANDOMS[type].next().value;
		blob[type] = temp;
	}
	saveBlob(blob);
}, 1000);
