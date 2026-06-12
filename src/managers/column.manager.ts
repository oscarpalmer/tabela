import {ColumnComponent} from '../components/column.component';
import {setFooter} from '../components/footer.component';
import {setHeader} from '../components/header.component';
import {getValidColumn} from '../helpers/misc.helpers';
import type {TabelaColumn} from '../models/column.model';
import {ARIA_COLCOUNT} from '../models/dom.model';
import type {State} from '../models/tabela.model';
import {removeCells} from './render.manager';

// #region Types

export class ColumnManager {
	items: ColumnComponent[] = [];

	keys: string[] = [];

	constructor(public state: State) {}

	destroy(): void {
		const {length} = this.items;

		for (let index = 0; index < length; index += 1) {
			this.items[index].destroy();
		}

		this.items = undefined as never;
		this.keys = undefined as never;
		this.state = undefined as never;
	}
}

// #endregion

// #region Functions

export function getColumn(state: State, key: string): ColumnComponent | undefined {
	return state.managers.column.items.find(item => item.options.key === key);
}

export function removeColumns(state: State, key: string): void;

export function removeColumns(state: State, keys: string[]): void;

export function removeColumns(state: State, value: unknown): void {
	const {items} = state.managers.column;

	const keys = (Array.isArray(value) ? value : [value]).filter(item => typeof item === 'string');

	const {length} = keys;

	if (length === 0) {
		return;
	}

	for (let keyIndex = 0; keyIndex < length; keyIndex += 1) {
		const itemIndex = items.findIndex(component => component.options.key === keys[keyIndex]);

		if (itemIndex > -1) {
			items[itemIndex].destroy();

			items.splice(itemIndex, 1);
		}
	}

	setHeader(state, items);
	setFooter(state, items);

	removeCells(state, keys);
}

export function setColumns(state: State, columns: TabelaColumn[]): void {
	const {items, keys} = state.managers.column;

	const validated = columns.map(getValidColumn).filter(item => item != null);

	if (validated.length === 0) {
		return;
	}

	items.splice(0, items.length, ...validated.map(column => new ColumnComponent(state, column)));
	keys.splice(0, keys.length, ...validated.map(column => column.key));

	setFooter(state, items);
	setHeader(state, items);

	state.element.setAttribute(ARIA_COLCOUNT, String(items.length));
}

// #endregion
