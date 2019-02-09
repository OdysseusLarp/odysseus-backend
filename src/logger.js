import logger from 'signale';

export const loggerMiddleware = (req, res, next) => {
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	logger.log(ip, req.method, req.url);
	next();
};

export { logger };

