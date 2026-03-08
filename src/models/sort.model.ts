export type TabelaSort = {
	add(field: string, direction?: TabelaSortDirection): void;
	clear(): void;
	flip(field: string): void;
	remove(field: string): void;
	set(items: TabelaSortItem[]): void;
};

export type TabelaSortDirection = 'ascending' | 'descending';

export type TabelaSortItem = {
	direction: TabelaSortDirection;
	field: string;
};
