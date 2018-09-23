// Helper middleware for handling errors in async routes
export const handleAsyncErrors = fn => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};
