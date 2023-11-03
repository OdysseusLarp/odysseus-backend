import { Request, Response, NextFunction } from 'express';

// Helper middleware for handling errors in async routes
export const handleAsyncErrors =
	(fn: (req: Request, res: Response, next: NextFunction) => any) =>
		(req: Request, res: Response, next: NextFunction) => {
			Promise.resolve(fn(req, res, next)).catch(next);
		};
