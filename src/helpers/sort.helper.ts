import {getValue, SORT_DIRECTION_ASCENDING} from '@oscarpalmer/atoms';
import type {SortDirection} from '@oscarpalmer/atoms/array/sort';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {
	sortDirections,
	type ExtendedArrayValueSorter,
	type TabelaSorter,
} from '../models/sort.model';

// #region Functions

function getDirection(direction: unknown): SortDirection {
	return sortDirections.has(direction as never)
		? (direction as SortDirection)
		: SORT_DIRECTION_ASCENDING;
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

	return undefined;
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
