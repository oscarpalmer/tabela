import {type SortDirection} from '@oscarpalmer/atoms/array/sort';
import {
	addSorter,
	clearSorters,
	flipSorter,
	getValidSorter,
	removeSorter,
	setSorters,
} from '../helpers/sort.helper';
import {type SortManager, type TabelaSort, type TabelaSorter} from '../models/sort.model';
import {SYMBOL, type State} from '../models/tabela.model';

// #region Instances

function SortManager(this: SortManager, state: State): void {
	this.default = [getValidSorter(state.options.sorting ?? state.key)!];
	this.items = [];

	// @ts-expect-error All good, no worries :-)
	this.handlers = new TabelaSort(state);
}

SortManager.prototype.destroy = destroySortManager;

Object.defineProperties(SortManager.prototype, {
	size: {
		enumerable: true,
		get: getSize,
	},
});

function TabelaSort(this: TabelaSort, state: State): void {
	this[SYMBOL] = state;
}

TabelaSort.prototype.add = addTabelaSorter;
TabelaSort.prototype.clear = clearTabelaSorters;
TabelaSort.prototype.flip = flipTabelaSorter;
TabelaSort.prototype.remove = removeTabelaSorter;
TabelaSort.prototype.set = setTabelaSorters;

// #endregion

// #region Functions

function addTabelaSorter(this: TabelaSort, key: string, direction?: SortDirection): void {
	addSorter(this[SYMBOL], key, direction);
}

function clearTabelaSorters(this: TabelaSort): void {
	clearSorters(this[SYMBOL]);
}

export function createSortManager(state: State): SortManager {
	// @ts-expect-error All good, no worries :-)
	return new SortManager(state);
}

function destroySortManager(this: SortManager): void {
	this.default = undefined as never;
	this.handlers = undefined as never;
	this.items = undefined as never;
}

function flipTabelaSorter(this: TabelaSort, key: string): void {
	flipSorter(this[SYMBOL], key);
}

function getSize(this: SortManager): number {
	return this.items.length === 0 ? (this.default == null ? 0 : 1) : this.items.length;
}

function removeTabelaSorter(this: TabelaSort, key: string): void {
	removeSorter(this[SYMBOL], key);
}

function setTabelaSorters(this: TabelaSort, items: TabelaSorter[], set: boolean): void {
	setSorters(this[SYMBOL], items, set);
}

// #endregion
