import logger from 'signale';

export const loggerMiddleware = (req, res, next) => {
	next();
	res.on('finish', () => {
		if (res.statusCode < 400) return;
		logger.error(`HTTP ${res.statusCode} ${req.method} ${req.url}`);
	});
};

export { logger };

