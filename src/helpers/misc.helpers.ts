import type {Key} from '@oscarpalmer/atoms/models';
import type {GroupComponent} from '../components/group.component';
import {EVENTS_NAMES, type EventName} from '../models/event.model';
import {GROUP_KEY_EXPRESSION, type TabelaGroup} from '../models/group.model';

export function getGroup(group: GroupComponent): TabelaGroup {
	return {
		value: group.value.original,
	};
}

export function getKey(value: unknown): Key | undefined {
	if (typeof value === 'number') {
		return value;
	}

	if (typeof value !== 'string') {
		return;
	}

	return integerExpression.test(value) ? Number.parseInt(value, 10) : value;
}

export function isEvent(value: unknown): value is EventName {
	return EVENTS_NAMES.has(value as EventName);
}

export function isGroupKey(key: unknown): boolean {
	return typeof key === 'string' && GROUP_KEY_EXPRESSION.test(key);
}

const integerExpression = /^\d+$/;
