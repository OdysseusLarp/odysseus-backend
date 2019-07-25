import { saveBlob } from '../helpers';

const blobs = [
	// Used for the once-per-game Velian minigame thingy
	{
		type: 'misc',
		id: 'velian',
		isActive: true, // If this minigame is not active, Datahub will not listen to changes
		canSendSignal: false,
		hasSentSignal: false,
		hackingComplete: false,
		// 6 hours for dev, must be set manually for each game via admin ui
		lifesupportRunsOutAt: Date.now() + 48 * 60 * 60 * 1000,
		// For calculating the life support bar
		lifesupportMaxTime: Date.now(),
		captainsLogText: `Vel et veniam corporis cupiditate in ullam.
Delectus culpa magnam blanditiis. Ipsa aut ipsum nostrum nihil debitis illo aut.
Placeat nobis amet ipsa. Suscipit vero tenetur non et. Ratione magni quam
sunt eaque dolor id nisi magni.`
	},
	// Used for artifacts that trigger some actions
	{
		type: 'misc',
		id: 'artifact_actions',
		actions: {
			CRYSTAL_GENERATOR: {
				is_usable: false,
				is_used: false,
				used_at: null,
				log_message: 'Jump crystal generator artifact has been activated. Jump crystals are now regenerated during jumps.'
			},
			HEALTH_BOOST: {
				is_usable: false,
				is_used: false,
				used_at: null,
				log_message: 'An artifact increased ship hull health to 100%'
			}
		}
	},
	// Dynamic HANSCA configs
	{
		type: 'misc',
		id: 'hansca',
		analyseBaseTime: 20
	},
	// Drone count for Flappy drone
	{
		type: 'misc',
		id: 'flappy_drone',
		amount: 1000000
	},
	{
		type: 'misc',
		id: 'medical',
		show_20110_tumor: true,
		show_20070_alien: false,
	},
	// Demo functionality
	// 13 tasks in total
	{
		type: 'misc',
		id: 'demo',
		eeBreakCount1: 3,	// break first 3 tasks on 30s intervals
		eeBreakTime1: 30,
		eeBreakCount2: 10,	// break next 7 tasks on 60s intervals
		eeBreakTime2: 60,
		fuseBox: 'fusebox_engineering',
		fuseBlowIntervalMin: 2,  // minimum delay from fixing fuse to blowing next one, minutes
		fuseBlowIntervalMax: 10, // minimum delay from blowing fuse to blowing next one, minutes
	},
	{
		type: 'misc',
		id: 'demostat',
		eeBroken: 0,
		fuseBlown: 0,
	},
];

blobs.forEach(saveBlob);
