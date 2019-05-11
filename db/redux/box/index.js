import { saveBlob } from '../helpers';
import fuseboxes from './fuseboxes';
import jumpdriveBlobs from './jumpdrive';

fuseboxes.forEach(saveBlob);
jumpdriveBlobs.forEach(saveBlob);
