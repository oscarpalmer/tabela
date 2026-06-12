import {SORT_DIRECTION_ASCENDING, type SortDirection} from '@oscarpalmer/atoms/array/sort';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getNumber} from '@oscarpalmer/atoms/number';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import type {GroupComponent} from '../components/group.component';
import {columnFooters, type TabelaColumn, type TabelaColumnFooter} from '../models/column.model';
import {filterComparisons, type TabelaFilterItem} from '../models/filter.model';
import {GROUP_KEY_EXPRESSION, type TabelaGroup} from '../models/group.model';
import {
	sortDirections,
	type ExtendedArrayValueSorter,
	type TabelaSorter,
} from '../models/sort.model';

// #region Types

function getDirection(direction: unknown): SortDirection {
	return sortDirections.has(direction as never)
		? (direction as SortDirection)
		: SORT_DIRECTION_ASCENDING;
}

function getFooter(value: unknown): TabelaColumnFooter | undefined {
	return columnFooters.has(value as TabelaColumnFooter) ? (value as TabelaColumnFooter) : undefined;
}

export function getKey(value: unknown): Key | undefined {
	if (typeof value === 'number') {
		return value;
	}

	if (typeof value !== 'string') {
		return;
	}

	const asNumber = getNumber(value);

	return Number.isNaN(asNumber) ? value : asNumber;
}

export function getSorter(original: ExtendedArrayValueSorter): TabelaSorter {
	return {
		direction: original.direction!,
		key: original.field,
	};
}

export function getTabelaFilter(item: TabelaFilterItem): TabelaFilterItem {
	return {
		comparison: item.comparison,
		key: item.key,
		value: item.value,
	};
}

export function getTabelaGroup(group: GroupComponent): TabelaGroup {
	return {
		value: group.value.original,
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

export function getValidSorter(value: unknown): ExtendedArrayValueSorter | undefined {
	if (typeof value === 'string') {
		return {
			direction: SORT_DIRECTION_ASCENDING,
			field: value,
			value: item => getValue(item as PlainObject, value as string),
		};
	}

	if (isSorter(value)) {
		return {
			direction: getDirection((value as TabelaSorter).direction),
			field: (value as TabelaSorter).key,
			value:
				(value as TabelaSorter).value ??
				(item => getValue(item as PlainObject, (value as TabelaSorter).key)),
		};
	}
}

export function isGroupKey(key: unknown): boolean {
	return typeof key === 'string' && GROUP_KEY_EXPRESSION.test(key);
}

export function isSorter(value: unknown): value is TabelaSorter {
	return (
		isPlainObject(value) &&
		typeof (value as TabelaSorter).key === 'string' &&
		('value' in (value as TabelaSorter)
			? typeof (value as TabelaSorter).value === 'function'
			: true)
	);
}

// #endregion
