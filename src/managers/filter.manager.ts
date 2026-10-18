import {addFilters, clearFilters, removeFilter, setFilters} from '../helpers/filter.helper';
import type {FilterManager, TabelaFilter, TabelaFilterItem} from '../models/filter.model';
import {SYMBOL, type State} from '../models/tabela.model';

// #region Instances

function FilterManager(this: FilterManager, state: State): void {
	this.active = new Set();
	this.cache = new Map();
	this.items = new Map();
	this.state = state;

	// @ts-expect-error All good, no worries :-)
	this.handlers = new TabelaFilter(state);
}

FilterManager.prototype.destroy = destroyFilterManager;

function TabelaFilter(this: TabelaFilter, state: State): void {
	this[SYMBOL] = state;
}

TabelaFilter.prototype.add = addTabelaFilters;
TabelaFilter.prototype.clear = clearTabelaFilters;
TabelaFilter.prototype.remove = removeTabelaFilter;
TabelaFilter.prototype.set = setTabelaFilters;

// #endregion

// #region Functions

function addTabelaFilters(this: TabelaFilter, value: TabelaFilterItem | TabelaFilterItem[]): void {
	addFilters(this[SYMBOL], value);
}

function clearTabelaFilters(this: TabelaFilter): void {
	clearFilters(this[SYMBOL]);
}

export function createFilterManager(state: State): FilterManager {
	// @ts-expect-error All good, no worries :-)
	return new FilterManager(state);
}

function destroyFilterManager(this: FilterManager): void {
	this.handlers = undefined as never;
	this.items = undefined as never;
	this.state = undefined as never;
}

function removeTabelaFilter(this: TabelaFilter, value: string | string[]): void {
	removeFilter(this[SYMBOL], value);
}

function setTabelaFilters(this: TabelaFilter, value: TabelaFilterItem | TabelaFilterItem[]): void {
	setFilters(this[SYMBOL], value);
}

// #endregion
