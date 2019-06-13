import { watch } from '../../store/store';
import { CHANNELS, fireEvent } from '../../dmx';
import { logger } from '../../logger';
import { isNumber } from 'lodash';

// Life support is hard-coded to correspond to fuse boxes
watch(['data', 'box'], (boxes, previousBoxes, state) => {
	for (const id of Object.keys(boxes)) {
		const box = boxes[id];
		const previous = previousBoxes[id];
		if (previous && box.fuses && isNumber(box.dmxFuse) && box.fuses[box.dmxFuse] !== previous.fuses[box.dmxFuse]) {
			if (box.fuses[box.dmxFuse]) {
				if (CHANNELS[box.dmxFixed]) {
					fireEvent(CHANNELS[box.dmxFixed]);
				} else {
					logger.error(`Fuse box ${id} contained invalid DMX channel dmxFixed=${box.dmxFixed}`);
				}
			} else {
				if (CHANNELS[box.dmxBroken]) {
					fireEvent(CHANNELS[box.dmxBroken]);
				} else {
					logger.error(`Fuse box ${id} contained invalid DMX channel dmxBroken=${box.dmxBroken}`);
				}
			}
		}
	}
});

