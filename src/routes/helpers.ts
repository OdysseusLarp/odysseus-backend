import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import { ZodError } from 'zod';
import { logger } from '../logger';

// Helper middleware for handling errors in async routes
export const handleAsyncErrors =
	(fn: (req: Request, res: Response, next: NextFunction) => any) =>
		(req: Request, res: Response, next: NextFunction) => {
			Promise.resolve(fn(req, res, next)).catch(next);
		};

export const errorHandlingMiddleware = async (err: HttpError, req: Request, res: Response, _next: NextFunction) => {
	let status = 500;
	let error: any = err.message;
	if ('statusCode' in err) {
		status = err.statusCode;
	}
	if (err instanceof ZodError) {
		status = 400;
		error = err.errors;
	}
	logger.error(err.message);
	return res.status(status).json({ error });
}
