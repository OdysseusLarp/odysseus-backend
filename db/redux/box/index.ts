import { saveBlob } from '../helpers';
import airlock from './airlock';
import fuseboxes from './fuseboxes';
import jumpdriveBlobs from './jumpdrive';
import driftingValueBlobs from './driftingValue';
import buttonboard from './buttonboard';
import reactorWiring from './reactorWiring';
import bigbattery from './bigbattery';
import kick from './kick';

const blobs = [
	...airlock,
	...fuseboxes,
	...jumpdriveBlobs,
	...driftingValueBlobs,
	...buttonboard,
	...reactorWiring,
	...bigbattery,
	...kick,
];
blobs.forEach(saveBlob);
