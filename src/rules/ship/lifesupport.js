import { saveBlob } from '../helpers';
import { watch } from '../../store/store';
import { logger } from '../../logger';

// FIXME: Add DMX output of life support health (if needed)

// Life support is hard-coded to correspond to fuse boxes
watch(['data', 'box'], (boxes, previousBoxes, state) => {
	let total = 0;
	let unbroken = 0;
	for (const id of Object.keys(boxes)) {
		const box = boxes[id];
		if (box.fuses) {
			total += box.fuses.length;
			unbroken += box.fuses.reduce((count, fuse) => count + (fuse ? 1 : 0));
		}
	}
	const health = unbroken / total;
	if (!state.data.ship.lifesupport || state.data.ship.lifesupport.health !== health) {
		logger.info(`Setting lifesupport health to ${unbroken}/${total} = ${health}`);
		saveBlob({
			type: 'ship',
			id: 'lifesupport',
			health,
			total,
			unbroken,
		});
	}
});

