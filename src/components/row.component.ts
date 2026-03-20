import type {Key} from '@oscarpalmer/atoms/models';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {setAttributes} from '@oscarpalmer/toretto/attribute';
import {createCell, createRow} from '../helpers/dom.helpers';
import {CSS_ROW_BODY, CSS_ROW_SELECTED} from '../models/style.model';
import type {State} from '../models/tabela.model';
import {
	ARIA_SELECTED,
	ATTRIBUTE_DATA_ACTIVE,
	ATTRIBUTE_DATA_EVENT,
	ATTRIBUTE_DATA_KEY,
} from '../models/dom.model';
import {EVENT_ROW} from '../models/event.model';

export function removeRow(state: State, row: RowComponent): void {
	if (row.element != null) {
		row.element.innerHTML = '';

		state.managers.render.pool.rows.push(row.element);

		row.element.remove();

		row.element = undefined;
	}

	row.cells = {};
}

export function renderRow(state: State, row: RowComponent): void {
	const {managers, options, prefix} = state;

	const element = row.element ?? managers.render.pool.rows.shift() ?? createRow(options.rowHeight);

	row.element = element;

	element.innerHTML = '';

	const selected = managers.selection.items.has(row.key);

	const key = String(row.key);

	setAttributes(element, {
		[ARIA_SELECTED]: String(selected),
		[ATTRIBUTE_DATA_ACTIVE]: String(managers.navigation.active === row.key),
		[ATTRIBUTE_DATA_EVENT]: EVENT_ROW,
		[ATTRIBUTE_DATA_KEY]: key,
		id: `${prefix}${key}`,
	});

	element.classList.add(CSS_ROW_BODY);

	if (selected) {
		element.classList.add(CSS_ROW_SELECTED);
	} else {
		element.classList.remove(CSS_ROW_SELECTED);
	}

	const columns = managers.column.items;
	const {length} = columns;

	const data = managers.data.state.values.mapped.get(row.key);

	if (data == null) {
		return;
	}

	for (let index = 0; index < length; index += 1) {
		const {options} = columns[index];
		const {key, width} = options;

		managers.render.pool.cells[key] ??= [];

		const cell = managers.render.pool.cells[key].shift() ?? createCell(width);

		cell.textContent = String(getValue(data, key));

		row.cells[key] = cell;

		element.append(cell);
	}
}

export class RowComponent {
	cells: Record<string, HTMLDivElement> = {};

	element: HTMLDivElement | undefined;

	constructor(readonly key: Key) {}
}
