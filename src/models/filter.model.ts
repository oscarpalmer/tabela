import type {Key} from '@oscarpalmer/atoms/models';
import {getNumber} from '@oscarpalmer/atoms/number';
import {endsWith, includes, startsWith} from '@oscarpalmer/atoms/string/match';
import {equal, type Equalizer} from '@oscarpalmer/atoms/value/equal';
import type {State, SYMBOL} from './tabela.model';

// #region Types

type FilterCache = {
	id: Map<number, FilterCacheItem>;
	value: Map<string, FilterCacheItem>;
};

type FilterCacheItem = {
	count: number;
	id: number;
	keys: Set<Key>;
	value: unknown;
};

type FilterComparator = (value: FilterComparatorValue, filter: FilterComparatorValue) => boolean;

type FilterComparatorValue = {
	raw: unknown;
	string: string;
};

export type FilterManager = {
	active: Set<string>;
	cache: Map<string, FilterCache>;
	handlers: TabelaFilter;
	items: Map<string, TabelaFilterItem>;
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

export const filterComparators: Record<string, FilterComparator> = {
	[FILTER_ENDS_WITH]: (value, filter) => endsWith(value.string, filter.string, true),
	[FILTER_EQUALS]: (value, filter) => filterEqualizer.compare(value.raw, filter.raw),
	[FILTER_GREATER_THAN]: (value, filter) => getNumber(value.raw) > getNumber(filter.raw),
	[FILTER_GREATER_THAN_OR_EQUAL]: (value, filter) => getNumber(value.raw) >= getNumber(filter.raw),
	[FILTER_INCLUDES]: (value, filter) => includes(value.string, filter.string, true),
	[FILTER_LESS_THAN]: (value, filter) => getNumber(value.raw) < getNumber(filter.raw),
	[FILTER_LESS_THAN_OR_EQUAL]: (value, filter) => getNumber(value.raw) <= getNumber(filter.raw),
	[FILTER_NOT_EQUALS]: (value, filter) => !filterEqualizer.compare(value.raw, filter.raw),
	[FILTER_NOT_INCLUDES]: (value, filter) => !includes(value.string, filter.string, true),
	[FILTER_STARTS_WITH]: (value, filter) => startsWith(value.string, filter.string, true),
};

export const filterEqualizer: Equalizer = equal.initialize({
	ignoreCase: true,
});

// #endregion

// #endregion
