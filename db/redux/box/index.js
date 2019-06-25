import { saveBlob } from '../helpers';
import airlock from './airlock';
import fuseboxes from './fuseboxes';
import jumpdriveBlobs from './jumpdrive';
import driftingValueBlobs from './driftingValue';

airlock.forEach(saveBlob);
fuseboxes.forEach(saveBlob);
jumpdriveBlobs.forEach(saveBlob);
driftingValueBlobs.forEach(saveBlob);
