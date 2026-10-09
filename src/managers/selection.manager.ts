import type {Key} from '@oscarpalmer/atoms/models';
import {on} from '@oscarpalmer/toretto/event';
import {
	addSelection,
	clearSelection,
	onSelectionMouseDown,
	onSelectionMouseMove,
	onSelectionMouseUp,
	onSelectionShiftDown,
	onSelectionShiftUp,
	removeSelection,
	setSelection,
	toggleSelection,
} from '../helpers/selection.helper';
import {
	mappedSelectionManagers,
	type SelectionManager,
	type TabelaSelection,
} from '../models/selection.model';
import {SYMBOL, type State} from '../models/tabela.model';

// #region Instances

function SelectionManager(this: SelectionManager, state: State): void {
	this.keys = new Set<Key>();
	this.state = state;

	// @ts-expect-error All good, no worries :-)
	this.handlers = new TabelaSelection(state);

	mappedSelectionManagers.set(state.elements.wrapper, this);
}

SelectionManager.prototype.destroy = destroySelectionManager;

function TabelaSelection(this: TabelaSelection, state: State): void {
	this[SYMBOL] = state;
}

TabelaSelection.prototype.add = addTabelaSelection;
TabelaSelection.prototype.clear = clearTabelaSelection;
TabelaSelection.prototype.remove = removeTabelaSelection;
TabelaSelection.prototype.set = setTabelaSelection;
TabelaSelection.prototype.toggle = toggleTabelaSelection;

// #endregion

// #region Functions

function addTabelaSelection(this: TabelaSelection, keys: Key[]): void {
	addSelection(this[SYMBOL], keys);
}

function clearTabelaSelection(this: TabelaSelection): void {
	clearSelection(this[SYMBOL]);
}

export function createSelectionManager(state: State): SelectionManager {
	// @ts-expect-error All good, no worries :-)
	return new SelectionManager(state);
}

function destroySelectionManager(this: SelectionManager): void {
	mappedSelectionManagers.delete(this.state.elements.wrapper);

	this.handlers = undefined as never;
	this.keys = undefined as never;
	this.last = undefined;
	this.state = undefined as never;
}

function removeTabelaSelection(this: TabelaSelection, keys: Key[]): void {
	removeSelection(this[SYMBOL], keys);
}

function setTabelaSelection(this: TabelaSelection, keys: Key[]): void {
	setSelection(this[SYMBOL], keys);
}

function toggleTabelaSelection(this: TabelaSelection): void {
	toggleSelection(this[SYMBOL]);
}

// #endregion

// #region Initialization

on(document, 'keydown', onSelectionShiftDown);
on(document, 'keyup', onSelectionShiftUp);
on(document, 'mousedown', onSelectionMouseDown);
on(document, 'mousemove', onSelectionMouseMove);
on(document, 'mouseup', onSelectionMouseUp);

// #endregion
