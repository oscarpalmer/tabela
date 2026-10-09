import {getNumber} from '@oscarpalmer/atoms/number';
import {getString} from '@oscarpalmer/atoms/string';
import {endsWith, includes, startsWith} from '@oscarpalmer/atoms/string/match';
import {equal, type Equalizer} from '@oscarpalmer/atoms/value/equal';
import type {State, SYMBOL} from './tabela.model';

// #region Types

export type FilterManager = {
	handlers: TabelaFilter;
	items: Record<string, TabelaFilterItem[]>;
	state: State;
	destroy(): void;
};

export type TabelaFilter = {
	[SYMBOL]: State;
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

// #endregion

// #region Variables

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

export const filterComparisons: Set<TabelaFilterComparison> = new Set([
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

// #region Variables

export const filterComparators: Record<string, (row: unknown, filter: unknown) => boolean> = {
	[FILTER_ENDS_WITH]: (row, filter) => endsWith(getString(row), getString(filter), true),
	[FILTER_EQUALS]: (row, filter) => filterEqualizer.compare(row, filter),
	[FILTER_GREATER_THAN]: (row, filter) => getNumber(row) > getNumber(filter),
	[FILTER_GREATER_THAN_OR_EQUAL]: (row, filter) => getNumber(row) >= getNumber(filter),
	[FILTER_INCLUDES]: (row, filter) => includes(getString(row), getString(filter), true),
	[FILTER_LESS_THAN]: (row, filter) => getNumber(row) < getNumber(filter),
	[FILTER_LESS_THAN_OR_EQUAL]: (row, filter) => getNumber(row) <= getNumber(filter),
	[FILTER_NOT_EQUALS]: (row, filter) => !filterEqualizer.compare(row, filter),
	[FILTER_NOT_INCLUDES]: (row, filter) => !includes(getString(row), getString(filter), true),
	[FILTER_STARTS_WITH]: (row, filter) => startsWith(getString(row), getString(filter), true),
};

export const filterEqualizer: Equalizer = equal.initialize({
	ignoreCase: true,
});

// #endregion

// #endregion
