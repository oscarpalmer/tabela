import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
import {getNumber} from '@oscarpalmer/atoms/number';
import {columnFooters, type TabelaColumn, type TabelaColumnFooter} from '../models/column.model';
import {filterComparisons, type TabelaFilterItem} from '../models/filter.model';
import {GROUP_KEY_EXPRESSION, type Group, type GroupComponent} from '../models/group.model';
import {type ExtendedArrayValueSorter, type TabelaSorter} from '../models/sort.model';

// #region Functions

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

export function getTabelaGroup(group: GroupComponent): Group {
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

export function isGroupKey(key: unknown): boolean {
	return typeof key === 'string' && GROUP_KEY_EXPRESSION.test(key);
}

// #endregion
