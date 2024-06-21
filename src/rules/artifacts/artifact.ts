import store, { watch } from '@/store/store';
import { saveBlob } from '../helpers';
import { SAFE_JUMP_LIMIT } from '../ship/jump';
import { STATUS_NUMBERS } from '../ship/jumpstate';
import { CHANNELS, fireEvent } from '@/dmx';
import { Ship } from '@/models/ship';
import { clone, set } from 'lodash';

/*
ARTIFACT STATE MACHINE:

Startup           --> Initial state          (solved: false)
Puzzle solved     --> Initial solved state   (solved: true, gm_approved: false, activated: false)
EVA integrated / GM approval --> Ready state (solved: true, gm_approved: true, activated: false)
Device activated  --> Activated              (solved: true, gm_approved: true, activated: true)
    ("Activated" is transient state, backend reacts immediately and sets gm_approved = false)
Backend reacts    --> Used state             (solved: true, gm_approved: false, activated: true)
GM re-approval    --> Ready state            (solved: true, gm_approved: true, activated: false)
*/

interface Artifact {
	id: string;
	code: string;
	solved: boolean;
	gm_approved: boolean;
	activated: boolean;
	speedup_multiplier?: number;
	speedup_duration_secs?: number;
}

function isActivated(artifact: Artifact) {
	// State is considered activated if it is solved, approved and activated.
	// State is then changed to gm_approved = false
	return artifact.solved && artifact.gm_approved && artifact.activated;
}

export function markArtifactActivationHandled(artifact: Artifact) {
	setTimeout(() =>
		saveBlob({
			...artifact,
			gm_approved: false,
		})
	);
}

function updateJumpDriveCooldown(current: Artifact, previous: Artifact) {
	if (isActivated(current)) {
		const jump = store.getState().data.ship.jump;
		const jumpstate = store.getState().data.ship.jumpstate;
		const safe_jump_limit = Date.now() - SAFE_JUMP_LIMIT;

		// Only use before 'ready' state
		if (jumpstate.statusno < STATUS_NUMBERS.ready) {
			// Set last_jump time to allow immediate safe jump
			if (jump.last_jump > safe_jump_limit) {
				saveBlob({
					...jump,
					last_jump: safe_jump_limit,
				});
			}
			saveBlob({
				...jumpstate,
				coherence: 100,
				jump_drive_temp_exact: jump.jump_drive_target_temp,
			});
			fireEvent(CHANNELS.JumpDriveCoolingArtifactActivated);
		}
		markArtifactActivationHandled(current);
	}
}

function updateCalibrationSlot(current: Artifact, previous: Artifact) {
	if (isActivated(current)) {
		const calibration = store.getState().data.ship.calibration;
		saveBlob({
			...calibration,
			slots: calibration.slots + 1,
		});
		fireEvent(CHANNELS.CalibrationSlotArtifactActivated);
		markArtifactActivationHandled(current);
	}
}

async function updateScanRangeExtender(current: Artifact, previous: Artifact) {
	if (isActivated(current)) {
		const id = 'odysseus';
		const ship = await Ship.forge({ id }).fetch();
		if (!ship) throw new Error('Ship not found');
		const metadata = clone(ship.get('metadata') || {});
		metadata.scan_range = metadata.scan_range + 1;
		await ship.save({ metadata }, { method: 'update', patch: true });

		fireEvent(CHANNELS.ScanRangeExtenderArtifactActivated);
		markArtifactActivationHandled(current);
	}
}

function updateCalibrationSpeedup(current: Artifact, previous: Artifact) {
	if (isActivated(current)) {
		const calibration = store.getState().data.ship.calibration;
		const originalMultiplier = calibration.multiplier;
		saveBlob({
			...calibration,
			multiplier: current.speedup_multiplier || 100,
		});
		setTimeout(
			() => {
				saveBlob({
					...calibration,
					multiplier: originalMultiplier,
				});
			},
			(current.speedup_duration_secs || 60) * 1000
		);
		fireEvent(CHANNELS.CalibrationSpeedupArtifactActivated);
		markArtifactActivationHandled(current);
	}
}

watch(['data', 'artifact', 'jump_drive_cooldown'], updateJumpDriveCooldown);
watch(['data', 'artifact', 'calibration_slot'], updateCalibrationSlot);
watch(['data', 'artifact', 'scan_range_extender'], updateScanRangeExtender);
watch(['data', 'artifact', 'calibration_speedup'], updateCalibrationSpeedup);
