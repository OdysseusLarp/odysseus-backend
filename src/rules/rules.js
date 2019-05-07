import path from 'path';
import fs from 'fs';
import { isFunction } from 'lodash';
import { logger } from '../logger';

/* Require all *.js files in all subdirectories */

fs.readdirSync(__dirname, { withFileTypes: true }).forEach((entry) => {
	if (isFunction(entry.isDirectory) && entry.isDirectory()) {
		const dir = path.join(__dirname, entry.name);
		fs.readdirSync(dir).forEach((file) => {
			if (file.endsWith('.js')) {
				const filePath = path.join(dir, file);
				require(filePath);
				logger.info('Loaded rule file', filePath);
			}
		});
	}
});
