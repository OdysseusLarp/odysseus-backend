import { saveBlob } from '../helpers';

// Jump drive state
saveBlob({
	type: 'ship',
	id: 'jump',
	status: 'ready_to_prep',
	jump_at: 0, // millisecond timestamp
	last_jump: 0, // millisecond timestamp
	breaking_jump: true,
	minor_breaking_jump: true, // first jump is always minor-breaking
	jump_end_warning_secs: 10, // Time between DMX signal and ending jump
	next_jump_mood: 1,

	// Current target temperature for jump drive (actual temperature is in `jumpstate`)
	jump_drive_target_temp: 800,

	// Default target temperatures:
	cooldown_target_temp: 800,
	regular_jump_target_temp: 4100,
	breaking_jump_target_temp: 5600,

	presets: {
		cooldown: {
			status: 'cooldown',
		},
		ready_to_prep: {
			status: 'ready_to_prep',
		},
		calculating: {
			status: 'calculating',
			note: 'Set proper coordinate values',
		},
		preparation: {
			status: 'preparation',
			note:
				"Switch to 'preparation' state ONLY from 'calculating' state! " +
				'Otherwise engineering tasks are not properly initialized.',
		},
		prep_complete: {
			status: 'prep_complete',
		},
		ready: {
			status: 'ready',
			breaking_jump: false,
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

saveBlob({
	type: 'ship',
	id: 'jumpstate',
	status: 'ready_to_prep',
	statusno: 2, // corresponds to above state
	cooldown_time: 'T-0:00',
	jump_time: 'T-0:00',
	coherence: 100,
	jump_drive_temp_exact: 800,
	jump_drive_temp: 800,
});

saveBlob({
	type: 'ship',
	id: 'lifesupport',
	health: 1,
});

saveBlob({
	type: 'ship',
	id: 'metadata',
	ee_sync_enabled: false,
	ee_connection_enabled: false,
	jump_ui_enabled: true,
	social_ui_enabled: true,
	infoboard_enabled: true,
});

saveBlob({
	type: 'ship',
	id: 'calibration',
	slots: 3,
	multiplier: 1,
});

// Generated using emulator
saveBlob({
	id: 'ee',
	type: 'ship',
	systems: {
		heat: {
			reactorHeat: 0,
			rearshieldHeat: 0,
			missilesystemHeat: 0,
			maneuverHeat: 0,
			beamweaponsHeat: 0,
			frontshieldHeat: 0,
			impulseHeat: 0,
			jumpdriveHeat: 0,
			warpHeat: 0,
		},
		health: {
			frontshieldHealth: 1,
			jumpdriveHealth: 1,
			rearshieldHealth: 1,
			impulseHealth: 1,
			missilesystemHealth: 1,
			reactorHealth: 1,
			maneuverHealth: 1,
			warpHealth: 1,
			beamweaponsHealth: 1,
		},
	},
	weapons: {
		homingCount: 12,
		nukeCount: 4,
		hvliCount: 20,
		mineCount: 8,
		empCount: 6,
	},
	general: {
		alertLevel: 'Normal',
		shipEnergy: 1000,
		shipHull: 250,
		shipHullMax: 250,
		shipHullPercent: 1,
		shipFrontShield: 200,
		shipRearShield: 200,
	},
	landingPads: {
		landingPadStatus1: 1,
		landingPadStatus2: 1,
		landingPadStatus3: 1,
		landingPadStatus4: 1,
	}
});

// EE Metadata blob, admin EE view won't work without this
saveBlob({
	isConnectionHealthy: true,
	lastErrorMessage: null,
	isEmulated: true,
	id: 'ee_metadata',
	type: 'ship',
});

// Limits on which normal/damaged/critical DMX health signals will be sent
saveBlob({
	help: 'Limits on which normal/damaged/critical/disabled DMX health signals will be sent. Values are for critical-damaged and damaged-normal limits. Disabled is always <= 0.',
	type: 'ship',
	id: 'dmx_limits',
	reactor: [0.25, 0.7],
	rearshield: [0.25, 0.7],
	missilesystem: [0.25, 0.7],
	maneuver: [0.25, 0.7],
	beamweapons: [0.25, 0.7],
	frontshield: [0.25, 0.7],
	impulse: [0.25, 0.7],
	hull: [0.25, 0.7],
	lifesupport: [0.25, 0.7],
	general: [0.25, 0.7],
	cooldown_seconds: 60,
});
