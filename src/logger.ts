import { Request, Response, NextFunction } from 'express';
import { Signale } from 'signale';

const logger = new Signale({
	types: {
		// Override the default debug logger to not be so intimidating
		debug: {
			badge: 'i',
			color: 'cyan',
			label: 'debug',
		},
	},
});

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
	next();
	res.on('finish', () => {
		if (res.statusCode < 400) return;
		logger.error(`HTTP ${res.statusCode} ${req.method} ${req.url}`);
	});
};

export { logger, loggerMiddleware };
