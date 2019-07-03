import store, { watch } from '../../store/store';
import { logger } from '../../logger';
import { saveBlob } from '../helpers';

const UP_INDEX = 11;
const DOWN_INDEX = 10;

watch(['data', 'box', 'buttonboard'], (button, previousBox, state) => {
	for (const box of Object.values(store.getState().data.box)) {
		if (box.boxType === 'shield_button' && box.status === 'broken') {
			const buttonState = getButtonState(button, box.buttonIndex);
			if (box.context.measuredValue === buttonState) {
				logger.info(`Marking box ${box.id} as fixed due to button state ${buttonState}`);
				saveBlob({
					...box,
					status: 'fixed',
				});
			}
		}
	}
});


function getButtonState(button, index) {
	if (!button.config || !button.config.pins || !button.config.pins[index]) {
		logger.error(`Could not find index ${index} from button.config.pins ${JSON.stringify(button.config)}`);
		return 0;
	}
	const connections = button.connected[index];
	if (connections && connections.includes(UP_INDEX)) {
		return 1;
	} else if (connections && connections.includes(DOWN_INDEX)) {
		return -1;
	} else {
		return 0;
	}
}
