import { get, isArray, isNumber } from 'lodash';
import { logger } from './logger';

function validateEqual(requiredValue, currentValue) {
	return requiredValue === currentValue;
}

function validateRange({ upper, lower }, currentValue) {
	if (!isNumber(upper) || !isNumber(lower) || !isNumber(currentValue)) {
		logger.warn('Non-numeric input passed to validateRange', { upper, lower, currentValue });
		return false;
	}
	return currentValue >= lower && currentValue <= upper;
}

function validateSome(acceptedValues, currentValue) {
	if (!isArray(acceptedValues)) {
		logger.warn('Non-array input passed to validateSome', { acceptedValues, currentValue });
		return false;
	}
	return acceptedValues.includes(currentValue);
}


function validateLesser(requiredValue, currentValue) {
	if (!isNumber(requiredValue) || !isNumber(currentValue)) {
		logger.warn('Non-numeric input passed to validateLesser', { requiredValue, currentValue });
		return false;
	}
	return currentValue < requiredValue;
}

function validateGreater(requiredValue, currentValue) {
	if (!isNumber(requiredValue) || !isNumber(currentValue)) {
		logger.warn('Non-numeric input passed to validateGreater', { requiredValue, currentValue });
		return false;
	}
	return currentValue > requiredValue;
}

const validators = {
	EQUAL: validateEqual,
	RANGE: validateRange,
	SOME: validateSome,
	LESSER: validateLesser,
	GREATER: validateGreater
};

export function validate(model) {
	const requirements = model.get('requirements'),
		boxValue = model.related('box').get('value');
	// TODO: proper validation
	if (boxValue === undefined) {
		logger.warn('Box value undefined in validation for task requirement id', model.get('id'));
		return false;
	}
	const validator = get(validators, requirements.type, () => {
		logger.info('No validator found for type', requirements.type);
		return false;
	});
	return validator(get(requirements, 'value'), get(boxValue, 'value'));
}
