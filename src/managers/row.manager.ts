import type {Key} from '@oscarpalmer/atoms/models';
import {removeRow, renderRow, RowComponent} from '../components/row.component';
import type {State} from '../models/tabela.model';
import {isKey} from '@oscarpalmer/atoms/is';

// #region Types

export class RowManager {
	components = new Map<Key, RowComponent>();

	constructor(public state: State) {}

	destroy(): void {
		clearRows(this.state);

		this.components = undefined as never;
		this.state = undefined as never;
	}
}

// #endregion

// #region Functions

export function clearRows(state: State): void {
	const {components} = state.managers.row;

	const rows = [...components.values()];
	const {length} = rows;

	for (let index = 0; index < length; index += 1) {
		removeRow(state, rows[index], true);
	}

	components.clear();
}

export function getRow(state: State, key: unknown, create: boolean): RowComponent | undefined {
	if (!isKey(key)) {
		return;
	}

	let row = state.managers.row.components.get(key);

	if (row == null && create) {
		row = new RowComponent(key);

		state.managers.row.components.set(key, row);
	}

	return row;
}

export function hasRow(state: State, key: unknown): boolean {
	return isKey(key) && state.managers.row.components.has(key);
}

export function removeRowByKey(state: State, key: unknown): void {
	const row = isKey(key) && state.managers.row.components.get(key);

	if (row) {
		removeRow(state, row, true);
	}
}

export function updateRow(state: State, key: Key): void {
	const row = state.managers.row.components.get(key);

	if (row?.element != null) {
		renderRow(state, row);
	}
}

// #endregion
