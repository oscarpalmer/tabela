export type TabelaFilter = {
	add(item: TabelaFilterItem): void;
	clear(): void;
	remove(key: string): void;
	remove(item: TabelaFilterItem): void;
	set(items: TabelaFilterItem[]): void;
};

export type TabelaFilterComparison =
	| 'contains'
	| 'ends-with'
	| 'equals'
	| 'greater-than'
	| 'greater-than-or-equal'
	| 'less-than'
	| 'less-than-or-equal'
	| 'not-contains'
	| 'not-equals'
	| 'starts-with';

export type TabelaFilterItem = {
	comparison: TabelaFilterComparison;
	key: string;
	value: unknown;
};

export const FILTER_CONTAINS: TabelaFilterComparison = 'contains';

export const FILTER_ENDS_WITH: TabelaFilterComparison = 'ends-with';

export const FILTER_EQUALS: TabelaFilterComparison = 'equals';

export const FILTER_GREATER_THAN: TabelaFilterComparison = 'greater-than';

export const FILTER_GREATER_THAN_OR_EQUAL: TabelaFilterComparison = 'greater-than-or-equal';

export const FILTER_LESS_THAN: TabelaFilterComparison = 'less-than';

export const FILTER_LESS_THAN_OR_EQUAL: TabelaFilterComparison = 'less-than-or-equal';

export const FILTER_NOT_CONTAINS: TabelaFilterComparison = 'not-contains';

export const FILTER_NOT_EQUALS: TabelaFilterComparison = 'not-equals';

export const FILTER_STARTS_WITH: TabelaFilterComparison = 'starts-with';
