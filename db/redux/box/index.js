import { saveBlob } from '../helpers';
import fuseboxes from './fuseboxes';
import jumpdriveBlobs from './jumpdrive';
import driftingValueBlobs from './driftingValue';

fuseboxes.forEach(saveBlob);
jumpdriveBlobs.forEach(saveBlob);
driftingValueBlobs.forEach(saveBlob);
