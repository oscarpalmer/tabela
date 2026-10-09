import {isKey} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
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

export function renderRow(state: State, row: RowComponent): void {
	const {managers, options, prefix} = state;

	const element =
		row.element ?? managers.render.pool.rows.shift() ?? createRowElement(options.rowHeight);

	row.element = element;

	element.innerHTML = '';

	const active = row.key === managers.navigation.active.row;
	const selected = managers.selection.keys.has(row.key);

	const key = String(row.key);

	setAttributes(element, {
		[ARIA_SELECTED]: String(selected),
		[ARIA_ROWINDEX]: String(state.managers.data.getIndex(row.key) + 1),
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
		const {options} = columns[index];
		const {key, width} = options;

		managers.render.pool.cells[key] ??= [];

		const cell = managers.render.pool.cells[key].shift() ?? createCellElement(width);

		cell.dataset.key = key;
		cell.id = `${prefix}_row_${row.key}_column_${key}`;
		cell.textContent = String(getValue(data, key));

		if (active && key === managers.navigation.active.column) {
			cell.setAttribute(ATTRIBUTE_DATA_ACTIVE, '');
		}

		row.cells[key] = cell;

		element.append(cell);
	}
}

export function updateRow(state: State, key: Key): void {
	const row = state.managers.row.components.get(key);

	if (row?.element != null) {
		renderRow(state, row);
	}
}

// #endregion
