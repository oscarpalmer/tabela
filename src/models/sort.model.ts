import {
	type SortDirection,
	SORT_DIRECTION_ASCENDING,
	SORT_DIRECTION_DESCENDING,
} from '@oscarpalmer/atoms/array/sort';

export type TabelaSort = {
	add(key: string, direction?: SortDirection): void;
	clear(): void;
	flip(key: string): void;
	remove(key: string): void;
	set(items: TabelaSortItem[]): void;
};

export type TabelaSortItem = {
	direction: SortDirection;
	key: string;
};

export const sortDirections = new Set<SortDirection>([
	SORT_DIRECTION_ASCENDING,
	SORT_DIRECTION_DESCENDING,
]);
