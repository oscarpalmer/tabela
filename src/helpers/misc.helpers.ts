import type {SortDirection} from '@oscarpalmer/atoms/array';
import {SORT_DIRECTION_ASCENDING} from '@oscarpalmer/atoms/array';
import type {Key} from '@oscarpalmer/atoms/models';
import type {GroupComponent} from '../components/group.component';
import {EVENTS_NAMES, type EventName} from '../models/event.model';
import {GROUP_KEY_EXPRESSION, type TabelaGroup} from '../models/group.model';
import {directions, type TabelaSortItem} from '../models/sort.model';

function getDirection(direction: unknown): SortDirection {
	return directions.has(direction as never)
		? (direction as SortDirection)
		: SORT_DIRECTION_ASCENDING;
}

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

export function getSorter(original: TabelaSortItem): TabelaSortItem {
	return {
		direction: original.direction,
		key: original.key,
	};
}

export function getValidSorter(value: unknown): TabelaSortItem | undefined {
	if (typeof value === 'string') {
		return {
			direction: SORT_DIRECTION_ASCENDING,
			key: value,
		};
	}

	if (
		typeof value === 'object' &&
		value !== null &&
		typeof (value as TabelaSortItem).key === 'string'
	) {
		return {
			direction: getDirection((value as TabelaSortItem).direction),
			key: (value as TabelaSortItem).key,
		};
	}
}

export function isEvent(value: unknown): value is EventName {
	return EVENTS_NAMES.has(value as EventName);
}

export function isGroupKey(key: unknown): boolean {
	return typeof key === 'string' && GROUP_KEY_EXPRESSION.test(key);
}

const integerExpression = /^\d+$/;
