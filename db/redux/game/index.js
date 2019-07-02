import { saveBlob } from '../helpers';
import eeHealth from './eeHealthTasks';
import manualTasks from './manualTasks';
import velian from './velian';
import lifesupport from './lifesupport';

eeHealth.forEach(saveBlob);
manualTasks.forEach(saveBlob);
velian.forEach(saveBlob);
lifesupport.forEach(saveBlob);
