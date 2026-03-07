export type SortDirection = 'ascending' | 'descending';

export type SortItem = {
	direction: SortDirection;
	field: string;
};
