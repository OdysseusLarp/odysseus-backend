import { watch } from '../../store/store';
import { logger } from '../../logger';
import { setTaskBroken, setTaskCalibrating } from '../tasks/tasks';

const BOX_IDS = [
    'fusebox-science',
    'fusebox-medical',
    'fusebox-engineering',
];

for (let boxId of BOX_IDS) {
    
    /**
     * Mark fuse box tasks as broken or fixed automatically.
     */
    watch(['data', 'box', boxId], (current, previous, state) => {
        if (!current || !current.fuses) {
            logger.error(`Invalid fusebox data: ${JSON.stringify(current)})`);
            return;
        }
        if (!state.data.task || !state.data.task[boxId]) {
            logger.error(`Could not find task corresponding to fuse box ID '${boxId}'`)
            return;
        }
        const task = state.data.task[boxId];
        
        const broken = current.fuses.find(e => e === 0) !== undefined;
        if (broken) {
            if (task.status !== 'broken') {
                logger.info(`Marking task '${boxId}' as broken due to fuses being blown: ${JSON.stringify(current.fuses)}`)
                setTaskBroken(task);
            }
        } else {
            if (task.status === 'broken') {
                logger.info(`Marking task '${boxId}' as calibrating due to fuses being fixed: ${JSON.stringify(current.fuses)}`)
                setTaskCalibrating(task);
            }
        }
    });

}
