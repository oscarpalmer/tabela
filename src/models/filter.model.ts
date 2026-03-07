export type FilterComparison =
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

export type FilterItem = {
	comparison: FilterComparison;
	field: string;
	value: unknown;
};
