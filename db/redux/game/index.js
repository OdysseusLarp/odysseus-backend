import { saveBlob } from '../helpers';
import eeHealth from './eeHealthTasks';
import manualTasks from './manualTasks';
import velian from './velian';

eeHealth.forEach(saveBlob);
manualTasks.forEach(saveBlob);
velian.forEach(saveBlob);
