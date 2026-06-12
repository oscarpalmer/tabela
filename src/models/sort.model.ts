import {
	type ArrayValueSorter,
	type SortDirection,
	SORT_DIRECTION_ASCENDING,
	SORT_DIRECTION_DESCENDING,
} from '@oscarpalmer/atoms/array/sort';
import type {PlainObject} from '@oscarpalmer/atoms/models';

// #region Types

export type ExtendedArrayValueSorter = {
	field: string;
} & ArrayValueSorter<PlainObject>;

export type TabelaSort = {
	add(key: string, direction?: SortDirection): void;
	clear(): void;
	flip(key: string): void;
	remove(key: string): void;
	set(items: TabelaSorter[]): void;
};

export type TableSortItem = {
	direction: SortDirection;
	key: string;
};

export type TabelaSorter = {
	direction: SortDirection;
	key: string;
	value?: (data: PlainObject) => unknown;
};

// #endregion

// #region Variables

export const sortDirections = new Set<SortDirection>([
	SORT_DIRECTION_ASCENDING,
	SORT_DIRECTION_DESCENDING,
]);

// #endregion
