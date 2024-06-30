const blobs = [];

blobs.push({
	type: 'box',
	id: 'drifting_value',
	status: 'initial',

	// Range 330 - 740 == 535 +- 205

	value: 530.5,         // current "real" value
	rndMagnitude: 0,      // current magnitude of white noise (internal)
	brownNoiseValue: 0,   // current brown noise value (internal)
	drift: 1,             // value drift per MINUTE (chosen randomly between min/maxDriftPerMinute)
	driftPause: 0,        // drift pause secs remaining (internal)
	sinePosition: 0,      // sine wave position (internal)

	engineBreakProb: 0.055, // probability of 1% engine health dropping PER SECOND

	minDriftPerMinute: 1.11, // minimum drift per MINUTE when randomizing drift  1.11 = 3h
	maxDriftPerMinute: 2.22, // maximum drift per MINUTE when randomizing drift  2.22 = 1.5h

	config: {
		safeRangeMin: 330,         // minimum safe value (backend uses)
		safeRangeMax: 740,         // maximum safe value (backend uses)

		maxRndMagnitude: 30,       // maximum white noise value when updating value
		rndMagnitudeDecay: 0.95,   // how fast random magnitude decays (stabilation time: 0.95 ~5s, 0.97 ~10s)
		brownNoiseSpeed: 0.1,      // magnitude how fast brown noise changes
		brownNoiseMax: 10,         // maximum absolute value of brownian noise
		sineMagnitude: 1,          // magnitude of sine wave
		sineSpeed: 60,             // sine cycle time in seconds
		driftDelayAfterAdjust: 60, // number of secs to pause drift after adjustment is done
		adjustUpAmount: 1.5,       // amount to adjust up per call (pressure rise)
		adjustDownAmount: 1,       // amount to adjust down per call (pressure release)
		probDriftDown: 0.66,       // probability drift will go downwards (otherwise upward)
		pressureLimit: 106,        // pressure limit to adjust down
	},

	presets: {
		reset_to_midpoint: {
			value: 535,
		},

		/*
		 * 6.66 = 0.5h
		 * 3.33 = 1.0h
		 * 2.22 = 1.5h
		 * 1.66 = 2h
		 * 1.11 = 3h
		 * 0.55 = 6h
		 */
		drift_duration_05_1h: {
			minDriftPerMinute: 3.33,
			maxDriftPerMinute: 6.66,
		},
		drift_duration_05_2h: {
			minDriftPerMinute: 1.66,
			maxDriftPerMinute: 6.66,
		},
		drift_duration_1_2h: {
			minDriftPerMinute: 1.66,
			maxDriftPerMinute: 3.33,
		},
		drift_duration_2_4h: {
			minDriftPerMinute: 0.83,
			maxDriftPerMinute: 1.66,
		},
		drift_duration_3_6h: {
			minDriftPerMinute: 0.55,
			maxDriftPerMinute: 1.11,
		},
		drift_duration_4_8h: {
			minDriftPerMinute: 0.42,
			maxDriftPerMinute: 0.83,
		},

		/*
		 * Time for 100% = 100 / 60 / <prob> minutes
		 */
		breaking_disable: {
			engineBreakProb: 0,
		},
		break_duration_10min: {
			engineBreakProb: 0.16,
		},
		break_duration_15min: {
			engineBreakProb: 0.11,
		},
		break_duration_20min: {
			engineBreakProb: 0.083,
		},
		break_duration_30min: {
			engineBreakProb: 0.055,
		},
		break_duration_45min: {
			engineBreakProb: 0.037,
		},
		break_duration_60min: {
			engineBreakProb: 0.027,
		},
	}
});

export default blobs;
