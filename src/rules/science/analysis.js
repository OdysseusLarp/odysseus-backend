import { interval, saveBlob } from '../helpers';
import { logger } from '../../logger';
import { addOperationResultsToArtifactEntry } from '../../utils/science';
import { OperationResult } from '../../models/tag';
import { getPath } from '../../store/store';

const POLL_FREQUENCY = 5 * 1000; // 5 seconds

async function processInProgressAnalysis() {
	const scheduledOperationsBlob = getPath(['data', 'misc', 'science_analysis_in_progress']);
	const inProgress = scheduledOperationsBlob.analysis_in_progress;
	if (!Array.isArray(inProgress)) {
		logger.error('Invalid science_analysis_in_progress blob', inProgress);
		return;
	}

	const now = Date.now();
	const completedOperations = inProgress.filter(({ completes_at }) => completes_at <= now);
	const remainingOperations = inProgress.filter(({ completes_at }) => completes_at > now);

	if (!completedOperations.length) {
		return;
	}

	for (const operation of completedOperations) {
		const operationResult = await new OperationResult({ id: operation.operation_result_id }).fetch();
		if (!operationResult) {
			logger.error('Invalid operation_result_id, not found from db', operation_result_id);
			continue;
		}
		await addOperationResultsToArtifactEntry(operationResult);
	}

	saveBlob({
		...scheduledOperationsBlob,
		analysis_in_progress: remainingOperations,
	});
}

interval(processInProgressAnalysis, POLL_FREQUENCY);
