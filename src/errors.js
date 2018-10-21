import { isFunction } from 'lodash';

// https://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax-babel#32749533
class ExtendableError extends Error {
	constructor(message) {
		super(message);
		this.name = this.constructor.name;
		if (isFunction(Error.captureStackTrace)) {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = (new Error(message)).stack;
		}
	}
}

export class InvalidParametersError extends ExtendableError { }

export class TaskNotLoadedError extends ExtendableError { }
export class TaskAlreadyLoadedError extends ExtendableError { }
export class TaskNotFoundError extends ExtendableError { }
