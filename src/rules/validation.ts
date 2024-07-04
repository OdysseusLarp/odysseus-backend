import { logger } from '@/logger';
import store from '@/store/store';

export function validateGameAndTaskMappings() {
	const tasks: Record<string, any> = store.getState().data.task;
	const games: Record<string, any> = store.getState().data.game;

	const taskGameMap = new Map<string, string>();
	const gameTaskMap = new Map<string, string>();

	for (const task of Object.values(tasks)) {
		if (task.game) {
			taskGameMap.set(task.id, task.game);
		}
	}
	for (const game of Object.values(games)) {
		if (game.task) {
			gameTaskMap.set(game.id, game.task);
		}
	}

	let validationErrors = 0;
	for (const [taskId, game] of taskGameMap) {
		if (!gameTaskMap.has(game)) {
			validationErrors++;
			logger.error(`Task '${taskId}' references game '${game}' which does not exist`);
		}
	}

	for (const [gameId, taskId] of gameTaskMap) {
		if (!taskGameMap.has(taskId)) {
			validationErrors++;
			logger.error(`Game '${gameId}' references task '${taskId}' which does not exist`);
		}
	}

	if (validationErrors === 0) {
		logger.success('Game and task mappings are valid');
	}
}
