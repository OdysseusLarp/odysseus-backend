import { Request, Response, NextFunction } from 'express';
import logger from 'signale';

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
	next();
	res.on('finish', () => {
		if (res.statusCode < 400) return;
		logger.error(`HTTP ${res.statusCode} ${req.method} ${req.url}`);
	});
};

export { logger, loggerMiddleware };
