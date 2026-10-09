import {
	type ArrayValueSorter,
	type SortDirection,
	SORT_DIRECTION_ASCENDING,
	SORT_DIRECTION_DESCENDING,
} from '@oscarpalmer/atoms/array/sort';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {State, SYMBOL} from './tabela.model';

// #region Types

export type ExtendedArrayValueSorter = {
	field: string;
} & ArrayValueSorter<PlainObject>;

export type SortManager = {
	default: ExtendedArrayValueSorter[];
	handlers: TabelaSort;
	items: ExtendedArrayValueSorter[];
	get size(): number;
	destroy(): void;
};

export type TabelaSort = {
	[SYMBOL]: State;
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

// #region Variables

export const SORT_NONE = 'none';

export const SORT_OTHER = 'other';

// #endregion

export const sortDirections: Set<SortDirection> = new Set([
	SORT_DIRECTION_ASCENDING,
	SORT_DIRECTION_DESCENDING,
]);

// #endregion
