import { saveBlob } from '../helpers';

// FIXME: Setup jump drive using pre-determined last_jump time.

// Jump drive state
saveBlob({
	type: 'ship',
	id: 'jump',
	status: 'ready_to_prep',
	prep_at: 0,     // timestamps
	safe_at: 0,
	jump_at: 0,
	last_jump: 0,
	safe_jump: true,
	presets: {
		cooldown: {
			status: 'cooldown',
		},
		ready_to_prep: {
			status: 'ready_to_prep',
		},
		calculating: {
			status: 'calculating',
			coordinates: '...', // FIXME: Update to correct parameters later
			note: 'Set proper coordinate values',
		},
		preparation: {
			status: 'preparation',
			note: 'Switch to \'preparation\' state ONLY from \'calculating\' state! ' +
                'Otherwise engineering tasks are not properly initialized.',
		},
		prep_complete: {
			status: 'prep_complete',
		},
		ready: {
			status: 'ready',
			safe_jump: true,
		},
		jump_initiated: {
			status: 'jump_initiated',
		},
		jumping: {
			status: 'jumping',
			note: 'Why would you use this?!?',
		},
	},
});
