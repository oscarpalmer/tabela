export type TabelaFilter = {
	add(item: TabelaFilterItem): void;
	clear(): void;
	remove(field: string): void;
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
	field: string;
	value: unknown;
};
