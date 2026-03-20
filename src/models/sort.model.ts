import type {SortDirection} from '@oscarpalmer/atoms/array';

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

export const SORT_ASCENDING: SortDirection = 'ascending';

export const SORT_DESCENDING: SortDirection = 'descending';

export const sortDirections = new Set<SortDirection>([SORT_ASCENDING, SORT_DESCENDING]);
