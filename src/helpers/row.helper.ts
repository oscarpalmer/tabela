import {isKey} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {setAttributes} from '@oscarpalmer/toretto/attribute';
import {createRow} from '../components/row.component';
import {
	ARIA_ROWINDEX,
	ARIA_SELECTED,
	ATTRIBUTE_DATA_ACTIVE,
	ATTRIBUTE_DATA_EVENT,
	ATTRIBUTE_DATA_KEY,
} from '../models/dom.model';
import {EVENT_ROW} from '../models/event.model';
import type {RowComponent} from '../models/row.model';
import {CSS_ROW_BODY, CSS_ROW_SELECTED} from '../models/style.model';
import type {State} from '../models/tabela.model';
import {getRowIndex} from './data/data.misc';
import {createCellElement, createRowElement} from './dom.helpers';

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
		return undefined;
	}

	let row = state.managers.row.components.get(key);

	if (row == null && create) {
		row = createRow(key);

		state.managers.row.components.set(key, row);
	}

	return row;
}

export function hasRow(state: State, key: unknown): boolean {
	return isKey(key) && state.managers.row.components.has(key);
}

export function removeRow(state: State, row: RowComponent, unmap?: boolean): void {
	if (row.element != null) {
		state.managers.render.observer.unobserve(row.element);

		row.element.innerHTML = '';

		state.managers.render.pool.rows.push(row.element);

		row.element.remove();

		row.element = undefined;
	}

	row.cells = {};

	if (unmap ?? false) {
		state.managers.row.components.delete(row.key);
	}
}

export function removeRowByKey(state: State, key: unknown): void {
	const row = isKey(key) && state.managers.row.components.get(key);

	if (row) {
		removeRow(state, row, true);
	}
}

export function renderRow(state: State, row: RowComponent, rowIndex: number): void {
	const {managers, options, prefix} = state;

	const element =
		row.element ?? managers.render.pool.rows.shift() ?? createRowElement(options.rowHeight);

	row.element = element;

	element.innerHTML = '';

	const active = row.key === managers.navigation.active.row;
	const selected = managers.selection.keys.has(row.key);

	const key = getString(row.key);

	setAttributes(element, {
		[ARIA_SELECTED]: getString(selected),
		[ARIA_ROWINDEX]: getString(rowIndex + 1),
		[ATTRIBUTE_DATA_EVENT]: EVENT_ROW,
		[ATTRIBUTE_DATA_KEY]: key,
		id: `${prefix}_row_${key}`,
	});

	if (active) {
		element.setAttribute(ATTRIBUTE_DATA_ACTIVE, '');
	}

	element.classList.add(CSS_ROW_BODY);

	if (selected) {
		element.classList.add(CSS_ROW_SELECTED);
	} else {
		element.classList.remove(CSS_ROW_SELECTED);
	}

	const columns = managers.column.items;
	const {length} = columns;

	const data = managers.data.data.values.mapped.get(row.key);

	if (data == null) {
		return;
	}

	for (let index = 0; index < length; index += 1) {
		const {key, options} = columns[index];

		managers.render.pool.cells[key.original] ??= [];

		const cell =
			managers.render.pool.cells[key.original].shift() ?? createCellElement(key.normalized);

		cell.dataset.key = key.original;
		cell.id = `${prefix}_row_${getString(row.key)}_column_${key.normalized}`;

		const value = getValue(data, key.original, state.options.relaxedKeys);

		if (typeof options.render === 'function') {
			const rendered = options.render(value, data, rowIndex);

			cell.textContent = '';

			cell.append(...((Array.isArray(rendered) ? rendered : [rendered]) as string[]));
		} else {
			cell.textContent = getString(value);
		}

		if (active && key.original === managers.navigation.active.column) {
			cell.setAttribute(ATTRIBUTE_DATA_ACTIVE, '');
		}

		row.cells[key.original] = cell;

		element.append(cell);
	}

	// Measure on render, to keep offsets in sync with the actual height
	state.managers.render.observer.observe(element);
}

export function updateRow(state: State, key: Key): void {
	const row = state.managers.row.components.get(key);

	if (row?.element != null) {
		renderRow(state, row, getRowIndex(state, row.key));
	}
}

// #endregion
