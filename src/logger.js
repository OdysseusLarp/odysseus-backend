import logger from 'signale';

export const loggerMiddleware = (req, res, next) => {
    logger.log(req.ip, req.method, req.url);
    next();
}

export { logger };

