const blobs = [];

blobs.push({
	type: 'box',
	id: 'thermic_fusion_regulator',
	task: 'thermic_fusion_regulator',
	status: 'initial',
	kick_success_probability: 1,
	config: {
		pin: 14,
	},
});

blobs.push({
	type: 'task',
	id: 'thermic_fusion_regulator',
	box: 'thermic_fusion_regulator',
	status: 'initial',
	failure_probability_per_minute: 0.01, // On avg every 70 minutes
	battery_charge_level_when_broken: 65,
	title: 'Thermic Fusion Conduit blockage',
	description:
		'The Thermic Fusion Conduits have experienced a cryo-static blockage, resulting in an inability to expel waste heat efficiently. This blockage may cause the Thermic Fusion Regulators to overheat and malfunction.\n\nRepairs require docking at a Level 3 or higher spaceport for Fusion Conduit purging and recalibration.',
	location: 'External hull, Thermic Fusion Conduit',
	map: 'deck3',
	mapX: 415,
	mapY: 1155,
	mapPosX: 100,
	mapPosY: 1000,
	calibrationTime: 0,
	calibrationCount: 0,
	dmxBroken: 'ThermicFusionRegulatorBroken',
	dmxFixed: 'ThermicFusionRegulatorFixed',
	presets: {
		break_on_avg_30min: {
			failure_probability_per_minute: 0.023,
		},
		break_on_avg_70min: {
			failure_probability_per_minute: 0.01,
		},
		break_on_avg_120min: {
			failure_probability_per_minute: 0.006,
		},
	},
});

export default blobs;
