import { logger } from '@/logger';
import store, { watch } from '@/store/store';
import { BigBattery, BigBatteryLocation, isBatteryConnectedAndCharged } from '@/utils/bigbattery-helpers';
import { LandingPadStates, getEmptyEpsilonClient } from '@/integrations/emptyepsilon/client';
import { shipLogger } from '@/models/log';

const fighterNames = ['ESSODY18', 'ESSODY23', 'ESSODY36'];
const fighterRepairedLogEntryTemplates = [
	'{fighterName} has been repaired',
	'{fighterName} is fully restored',
	'{fighterName} is back in working order',
	'{fighterName} is back to operational status',
	'{fighterName} is in top condition',
];

const getRandomLogEntry = (fighterName: string) => {
	const randomIndex = Math.floor(Math.random() * fighterRepairedLogEntryTemplates.length);
	return fighterRepairedLogEntryTemplates[randomIndex].replace('{fighterName}', fighterName);
};

async function repairFighter(landingPad: number) {
	logger.info(`Battery connected, repairing fighter ${landingPad}`);
	await getEmptyEpsilonClient().setLandingPadState(landingPad, LandingPadStates.Docked);
	await shipLogger.info(getRandomLogEntry(fighterNames[landingPad - 1]));
}

async function checkIfFighterFixed() {
	const battery: BigBattery = store.getState().data.box.bigbattery;
	if (!battery) {
		logger.error('Big battery box not found');
		return;
	}

	const eeState = store.getState().data.ship.ee;
	if (!eeState) {
		logger.error('Empty Epsilon state not found');
		return;
	}

	const isFighter1Destroyed = eeState.landingPads.landingPadStatus1 === LandingPadStates.Destroyed;
	const isFighter2Destroyed = eeState.landingPads.landingPadStatus2 === LandingPadStates.Destroyed;
	const isFighter3Destroyed = eeState.landingPads.landingPadStatus3 === LandingPadStates.Destroyed;

	if (isFighter1Destroyed && isBatteryConnectedAndCharged(battery, BigBatteryLocation.FIGHTER1)) {
		await repairFighter(1);
	}
	if (isFighter2Destroyed && isBatteryConnectedAndCharged(battery, BigBatteryLocation.FIGHTER2)) {
		await repairFighter(2);
	}
	if (isFighter3Destroyed && isBatteryConnectedAndCharged(battery, BigBatteryLocation.FIGHTER3)) {
		await repairFighter(3);
	}
}

watch(['data', 'box', 'bigbattery'], checkIfFighterFixed);
