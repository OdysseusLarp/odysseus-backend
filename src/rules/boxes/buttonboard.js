import store, { watch } from '../../store/store';
import { logger } from '../../logger';
import { saveBlob } from '../helpers';

const UP_INDEX = 11;
const DOWN_INDEX = 10;

/*
 * Logic that changes "logical" task boxes from broken to fixed state based on
 * the physical "buttonboard" task box.
 *
 * The logic checks whether the button state indicated by `box.buttonIndex`
 * is in the expected state `box.context.measuredValue`.  The context is added
 * when breaking the task in breakTask.js method getAdditionalContext.
 */
const BUTTON_TASK_TYPES = ['shield_button', 'missile_button', 'bwms_button'];
watch(['data', 'box', 'buttonboard'], (button, previousBox, state) => {
	// Loop through box types and detect button board logical boxes based on box.boxType
	for (const box of Object.values(store.getState().data.box)) {
		if (BUTTON_TASK_TYPES.includes(box.boxType) && box.status === 'broken') {
			// If button state is in expected value, fix the box
			const buttonState = getButtonState(button, box.buttonIndex);
			if (box.context.measuredValue === buttonState) {
				logger.info(
					`Marking box ${box.id} as fixed due to button state ${buttonState}`
				);
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
		logger.error(
			`Could not find index ${index} from button.config.pins ${JSON.stringify(
				button.config
			)}`
		);
		return 0;
	}
	// NOTE: Must check first for connection +1 because pins pulled HIGH are considered to be
	// connected to all other pins, but code expects +1 instead of -1
	const connections = button.connected[index];
	if (connections && connections.includes(UP_INDEX)) {
		return 1;
	} else if (connections && connections.includes(DOWN_INDEX)) {
		return -1;
	} else {
		return 0;
	}
}
