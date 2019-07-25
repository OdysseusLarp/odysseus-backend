import { interval, randomInt, saveBlob } from '../helpers';
import store from '../../store/store';
import { logger } from '../../logger';


const MINUTE = 60*1000;

let lastBlowTime = Date.now();
let lastFixedTime = Date.now();
let wasBroken = false;

interval(() => {
	const demo = store.getState().data.misc.demo;
	const stat = store.getState().data.misc.demostat;
	const box = store.getState().data.box[demo.fuseBox];
	if (!box || !box.fuses) {
		logger.error(`No fuse box with ID ${demo.fuseBox} found`);
		return;
	}

	const isBroken = box.status === 'broken';
	if (wasBroken && !isBroken) {
		lastFixedTime = Date.now();
	}
	wasBroken = isBroken;

	if (!isBroken &&
		lastBlowTime + demo.fuseBlowIntervalMax * MINUTE < Date.now() &&
		lastFixedTime + demo.fuseBlowIntervalMin * MINUTE < Date.now()) {
		if (!box.blow) {
			const fuse = randomInt(0, box.fuses.length-1);
			logger.info(`Blowing fuse ${fuse} of box ${box.id}`);
			saveBlob({
				...box,
				blow: [fuse],
			});
			saveBlob({
				...stat,
				fuseBlown: (stat.fuseBlown || 0) + 1,
			});
		} else {
			logger.error(`Fusebox ${box.id} has 'blow' field, box probably not working: ${JSON.stringify(box.blow)}`);
		}
		lastBlowTime = Date.now();
	}
}, 1000);

