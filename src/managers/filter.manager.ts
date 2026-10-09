import {addFilter, clearFilters, removeFilter, setFilters} from '../helpers/filter.helper';
import type {FilterManager, TabelaFilter, TabelaFilterItem} from '../models/filter.model';
import {SYMBOL, type State} from '../models/tabela.model';

// #region Instances

function FilterManager(this: FilterManager, state: State): void {
	this.items = {};
	this.state = state;

	// @ts-expect-error All good, no worries :-)
	this.handlers = new TabelaFilter(state);
}

FilterManager.prototype.destroy = destroyFilterManager;

function TabelaFilter(this: TabelaFilter, state: State): void {
	this[SYMBOL] = state;
}

TabelaFilter.prototype.add = addTabelaFilter;
TabelaFilter.prototype.clear = clearTabelaFilters;
TabelaFilter.prototype.remove = removeTabelaFilter;
TabelaFilter.prototype.set = setTabelaFilters;

// #endregion

// #region Functions

function addTabelaFilter(this: TabelaFilter, item: TabelaFilterItem): void {
	addFilter(this[SYMBOL], item);
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

function removeTabelaFilter(this: TabelaFilter, value: string | TabelaFilterItem): void {
	removeFilter(this[SYMBOL], value);
}

function setTabelaFilters(this: TabelaFilter, items: TabelaFilterItem[]): void {
	setFilters(this[SYMBOL], items);
}

// #endregion
