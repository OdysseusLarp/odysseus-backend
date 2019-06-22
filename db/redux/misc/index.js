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
	}
];

blobs.forEach(saveBlob);
