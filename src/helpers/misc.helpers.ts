import type {Key} from '@oscarpalmer/atoms/models';

export function getKey(value: unknown): Key | undefined {
	if (typeof value === 'number') {
		return value;
	}

	if (typeof value !== 'string') {
		return;
	}

	return integerExpression.test(value) ? Number.parseInt(value, 10) : value;
}

const integerExpression = /^\d+$/;
