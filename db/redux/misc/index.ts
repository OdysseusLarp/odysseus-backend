import { saveBlob } from '../helpers';
import { Stores } from '../../../src/store/types';
import { SkillLevels } from '../../../src/utils/groups';
import { Duration } from '../../../src/utils/time';

const blobs: unknown[] = [
	// Used for the once-per-game Velian minigame thingy
	{
		type: 'misc',
		id: 'velian',
		isActive: true, // If this minigame is not active, Datahub will not listen to changes
		canSendSignal: false, // Setting this to true allows the player to send the distress signal via Datahub
		hasSentSignal: false, // True when the distress signal has been sent, so it can't be sent again
		hackingComplete: false, // Players need to complete the hacking minigame to interact with the app in Datahub
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
				log_message:
					'Jump crystal generator artifact has been activated. Jump crystals are now regenerated during jumps.',
			},
			HEALTH_BOOST: {
				is_usable: false,
				is_used: false,
				used_at: null,
				log_message: 'An artifact increased ship hull health to 100%',
			},
		},
	},
	// Dynamic HANSCA configs
	{
		type: 'misc',
		id: 'hansca',
		analyseBaseTime: 90,
	},
	// Drone count for Flappy drone
	{
		type: 'misc',
		id: 'flappy_drone',
		amount: 10,
	},
	{
		type: 'misc',
		id: 'medical',
		show_20110_tumor: true,
		show_20070_alien: false,
	},
	{
		type: 'misc',
		id: Stores.HackerDetectionTimes,
		detection_times: {
			[SkillLevels.Novice]: Duration.minutes(1),
			[SkillLevels.Master]: Duration.minutes(2),
			[SkillLevels.Expert]: Duration.minutes(5),
		},
	},
	{
		type: 'misc',
		id: Stores.ScienceAnalysisTimes,
		analysis_times: {
			[SkillLevels.Novice]: Duration.minutes(5),
			[SkillLevels.Master]: Duration.minutes(2),
			[SkillLevels.Expert]: Duration.seconds(15),
			// Big battery reduces science analysis time when plugged in to the science lab
			batteryless_operation_penalty: Duration.minutes(15),
		},
	},
	{
		type: 'misc',
		id: Stores.ScienceAnalysisInProgress,
		analysis_in_progress: [],
	},
	{
		type: 'misc',
		id: Stores.TagUidToArtifactCatalogId,
		tagUidToArtifactCatalogId: {
			'046C948A2A6280': 'ARAKNIUM-444',
			'0468948A2A6280': 'BEACON-1',
			'0464948A2A6280': 'BEACON-2',
			'0460948A2A6280': 'BEACON-3',
			'045C948A2A6280': 'BEACON-4',
			'0458948A2A6280': 'BEACON-5',
			'0454948A2A6280': 'BEACON-6',
			'0450948A2A6280': 'CJ2889',
			'044E6BE2486281': 'E-227y7',
			'044C948A2A6280': 'E-376W',
			'0448948A2A6280': 'EL-QV57-1',
			'0444948A2A6280': 'EL-QV57-2',
			'0441958A2A6280': 'EL-QV57-3',
			'043D958A2A6280': 'EL-QV57-4',
			'0439958A2A6280': 'EL-QV57-5',
			'0435958A2A6280': 'EL-QV57-6',
			'0418948A2A6280': 'EL-QV57-7',
			'0414948A2A6280': 'HERB-284',
			'0410948A2A6280': 'JW2888',
			'040C948A2A6280': 'VE-342',
			'0408938A2A6280': 'WORM-1',
			'0489938A2A6280': 'WORM-1',
		},
	},
	{
		type: 'misc',
		id: 'starcaller_game',
		description: 'Starcaller Unity game state',
		first_task_started: false,
		second_task_finished: false,
		third_task_finished: false,
	},
];

blobs.forEach(saveBlob);
