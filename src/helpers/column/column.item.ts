import {filter} from '@oscarpalmer/atoms/array/filter';
import {select} from '@oscarpalmer/atoms/array/select';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import {getString} from '@oscarpalmer/atoms/string';
import {createColumn} from '../../components/column.component';
import type {ColumnComponent, TabelaColumn} from '../../models/column.model';
import {ARIA_COLCOUNT} from '../../models/dom.model';
import type {State} from '../../models/tabela.model';
import {setFooter} from '../footer.helper';
import {setHeader} from '../header.helper';
import {removeCells} from '../render/render.misc';
import {updateColumnWidthStyling} from '../style.helper';
import {getColumnFooter, getColumnLabel} from './column.misc';

// #region Functions

export function getColumn(state: State, key: string): ColumnComponent | undefined {
	return state.managers.column.items.find(item => item.key.original === key);
}

export function getValidColumn(value: unknown): TabelaColumn {
	if (!isPlainObject(value)) {
		throw new TypeError('Column must be a plain object');
	}

	const column = value as TabelaColumn;

	if (typeof column.key !== 'string' || column.key.trim().length === 0) {
		throw new TypeError('Column key must be a non-empty string');
	}

	if (column.render != null && typeof column.render !== 'function') {
		throw new TypeError('Column render must be a function if defined');
	}

	return {
		filterable: typeof column.filterable === 'boolean' ? column.filterable : true,
		footer: getColumnFooter(column.footer),
		label: getColumnLabel(column.label) ?? column.key,
		key: column.key,
		render: column.render,
		sortable: typeof column.sortable === 'boolean' ? column.sortable : true,
		width:
			typeof column.width === 'number' && !Number.isNaN(column.width) ? column.width : undefined,
	};
}

export function removeColumns(state: State, key: string): void;

export function removeColumns(state: State, keys: string[]): void;

export function removeColumns(state: State, value: unknown): void {
	const {items} = state.managers.column;

	const keys = filter(Array.isArray(value) ? value : [value], item => typeof item === 'string');

	const {length} = keys;

	if (length === 0) {
		return;
	}

	for (let keyIndex = 0; keyIndex < length; keyIndex += 1) {
		const itemIndex = items.findIndex(component => component.key.original === keys[keyIndex]);

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

	const validated = select.reverse(columns, getValidColumn, item => item != null);

	if (validated.length === 0) {
		return;
	}

	items.splice(0, items.length, ...validated.map(column => createColumn(state, column)));
	keys.splice(0, keys.length, ...validated.map(column => column.key));

	setHeader(state, items);
	setFooter(state, items);

	state.elements.table.setAttribute(ARIA_COLCOUNT, getString(items.length));

	updateColumnWidthStyling(state);
}

// #endregion
