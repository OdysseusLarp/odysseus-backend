import { saveBlob } from '../helpers';
import eeHealth from './eeHealthTasks';
import manualTasks from './manualTasks';

eeHealth.forEach(saveBlob);
manualTasks.forEach(saveBlob);
