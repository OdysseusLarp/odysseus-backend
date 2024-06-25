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
			// TODO: Fill this with actual data
			ABCDEF123456: 'BEACON-1',
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
