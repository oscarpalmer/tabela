import {SORT_DIRECTION_ASCENDING, type SortDirection} from '@oscarpalmer/atoms/array/sort';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
import type {GroupComponent} from '../components/group.component';
import {columnFooters, type TabelaColumn, type TabelaColumnFooter} from '../models/column.model';
import {EVENTS_NAMES, type EventName} from '../models/event.model';
import {filterComparisons, type TabelaFilterItem} from '../models/filter.model';
import {GROUP_KEY_EXPRESSION, type TabelaGroup} from '../models/group.model';
import {sortDirections, type TabelaSortItem} from '../models/sort.model';

function getDirection(direction: unknown): SortDirection {
	return sortDirections.has(direction as never)
		? (direction as SortDirection)
		: SORT_DIRECTION_ASCENDING;
}

export function getFilter(item: TabelaFilterItem): TabelaFilterItem {
	return {
		comparison: item.comparison,
		key: item.key,
		value: item.value,
	};
}

function getFooter(value: unknown): TabelaColumnFooter | undefined {
	return columnFooters.has(value as TabelaColumnFooter) ? (value as TabelaColumnFooter) : undefined;
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

export function getValidColumn(value: unknown): TabelaColumn | undefined {
	if (!isPlainObject(value)) {
		return;
	}

	const column = value as TabelaColumn;

	if (typeof column.key !== 'string' || column.key.trim().length === 0) {
		return;
	}

	return {
		footer: getFooter(column.footer),
		label:
			typeof column.label === 'string' && column.label.trim().length > 0
				? column.label
				: column.key,
		key: column.key,
		width:
			typeof column.width === 'number' && !Number.isNaN(column.width) ? column.width : undefined,
	};
}

export function getValidFilter(value: unknown): TabelaFilterItem | undefined {
	if (!isPlainObject(value)) {
		return;
	}

	const filter = value as TabelaFilterItem;

	if (typeof filter.key !== 'string' || filter.key.trim().length === 0) {
		return;
	}

	if (!filterComparisons.has(filter.comparison)) {
		return;
	}

	return {
		comparison: filter.comparison,
		key: filter.key,
		value: filter.value,
	};
}

export function getValidSorter(value: unknown): TabelaSortItem | undefined {
	if (typeof value === 'string') {
		return {
			direction: SORT_DIRECTION_ASCENDING,
			key: value,
		};
	}

	if (isPlainObject(value) && typeof (value as TabelaSortItem).key === 'string') {
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
