import { info } from 'console';
import { saveBlob } from '../helpers';

/*
ARTIFACT STATE MACHINE:

Startup           --> Initial state          (solved: false)
Puzzle solved     --> Initial solved state   (solved: true, gm_approved: false, activated: false)
EVA integrated / GM approval --> Ready state (solved: true, gm_approved: true, activated: false)
Device activated  --> Activated              (solved: true, gm_approved: true, activated: false)
    ("Activated" is transient state, backend reacts immediately and sets gm_approved = false)
Backend reacts    --> Used state             (solved: true, gm_approved: false, activated: true)
GM re-approval    --> Ready state            (solved: true, gm_approved: true, activated: false)

"code" is the artifact code shown to scientists from artifact database.
"code" and "info" fields in the blob are informative only and unused.
*/

saveBlob({
	type: 'artifact',
	id: 'power_source',
	code: 'EV-QV57-1',
	solved: false,
	gm_approved: false,
	activated: false,
});
// EV-QV57-2 Cloaking device not integrated with backend
// EV-QV57-3 Healing device not integrated with backend
saveBlob({
	type: 'artifact',
	id: 'jump_drive_cooldown',
	code: 'EV-QV57-4',
	info: 'Immediate jump drive cooldown',
	solved: true, // Artifact has no puzzle
	gm_approved: false,
	activated: false,
});
saveBlob({
	type: 'artifact',
	id: 'calibration_slot',
	code: 'EV-QV57-5',
	info: 'Provides additional calibration slot, single-use',
	solved: false,
	gm_approved: false,
	activated: false,
});
saveBlob({
	type: 'artifact',
	id: 'scan_range_extender',
	code: 'EV-QV57-6',
	info: 'Increases LORA scanner range',
	solved: false,
	gm_approved: false,
	activated: false,
});
saveBlob({
	type: 'artifact',
	id: 'calibration_speedup',
	code: 'EV-QV57-7',
	info: 'Speeds up calibration process by 100x for 1 minute',
	solved: false,
	gm_approved: false,
	activated: false,
});
