import type {SortDirection} from '@oscarpalmer/atoms/array';

export type TabelaSort = {
	add(key: string, direction?: TabelaSortDirection): void;
	clear(): void;
	flip(key: string): void;
	remove(key: string): void;
	set(items: TabelaSortItem[]): void;
};

export type TabelaSortDirection = SortDirection;

export type TabelaSortItem = {
	direction: TabelaSortDirection;
	key: string;
};

export const SORT_ASCENDING: TabelaSortDirection = 'ascending';

export const SORT_DESCENDING: TabelaSortDirection = 'descending';
