import type {Key} from '@oscarpalmer/atoms/models';
import {GROUP_KEY_EXPRESSION} from '../models/group.model';

export function getKey(value: unknown): Key | undefined {
	if (typeof value === 'number') {
		return value;
	}

	if (typeof value !== 'string') {
		return;
	}

	return integerExpression.test(value) ? Number.parseInt(value, 10) : value;
}

export function isGroupKey(key: unknown): boolean {
	return typeof key === 'string' && GROUP_KEY_EXPRESSION.test(key);
}

const integerExpression = /^\d+$/;
