import path from 'path';
import fs from 'fs';
import { isFunction, isString } from 'lodash';
import { logger } from '../logger';

/* Require all *.js files in all subdirectories */

fs.readdirSync(__dirname, { withFileTypes: true }).forEach((entry) => {
	if (isString(entry)) {
		logger.warn(
			`Rule file ${entry} recognized as a string instead of Dirent, check that you are running Node v10.10.0 or later`
		);
	}
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
