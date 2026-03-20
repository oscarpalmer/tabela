export type TabelaFilter = {
	add(item: TabelaFilterItem): void;
	clear(): void;
	remove(key: string): void;
	remove(item: TabelaFilterItem): void;
	set(items: TabelaFilterItem[]): void;
};

export type TabelaFilterComparison =
	| 'ends-with'
	| 'equals'
	| 'greater-than-or-equal'
	| 'greater-than'
	| 'includes'
	| 'less-than-or-equal'
	| 'less-than'
	| 'not-equals'
	| 'not-includes'
	| 'starts-with';

export type TabelaFilterItem = {
	comparison: TabelaFilterComparison;
	key: string;
	value: unknown;
};

export const FILTER_ENDS_WITH: TabelaFilterComparison = 'ends-with';

export const FILTER_EQUALS: TabelaFilterComparison = 'equals';

export const FILTER_GREATER_THAN: TabelaFilterComparison = 'greater-than';

export const FILTER_GREATER_THAN_OR_EQUAL: TabelaFilterComparison = 'greater-than-or-equal';

export const FILTER_INCLUDES: TabelaFilterComparison = 'includes';

export const FILTER_LESS_THAN: TabelaFilterComparison = 'less-than';

export const FILTER_LESS_THAN_OR_EQUAL: TabelaFilterComparison = 'less-than-or-equal';

export const FILTER_NOT_EQUALS: TabelaFilterComparison = 'not-equals';

export const FILTER_NOT_INCLUDES: TabelaFilterComparison = 'not-includes';

export const FILTER_STARTS_WITH: TabelaFilterComparison = 'starts-with';

export const filterComparisons = new Set<TabelaFilterComparison>([
	FILTER_ENDS_WITH,
	FILTER_EQUALS,
	FILTER_GREATER_THAN,
	FILTER_GREATER_THAN_OR_EQUAL,
	FILTER_INCLUDES,
	FILTER_LESS_THAN,
	FILTER_LESS_THAN_OR_EQUAL,
	FILTER_NOT_INCLUDES,
	FILTER_NOT_EQUALS,
	FILTER_STARTS_WITH,
]);
