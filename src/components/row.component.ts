import type {Key} from '@oscarpalmer/atoms/models';
import {setAttributes} from '@oscarpalmer/toretto/attribute';
import {createCell, createRow} from '../helpers/dom.helpers';
import type {RenderElementPool} from '../models/render.model';
import type {TabelaState} from '../models/tabela.model';

export function removeRow(pool: RenderElementPool, row: RowComponent): void {
	if (row.element != null) {
		row.element.innerHTML = '';

		pool.rows.push(row.element);
		row.element.remove();

		row.element = undefined;
	}

	row.cells = {};
}

export function renderRow(state: TabelaState, row: RowComponent): void {
	const element = row.element ?? state.managers.render.pool.rows.shift() ?? createRow();

	row.element = element;

	element.innerHTML = '';

	const selected = state.managers.selection.items.has(row.key);

	const key = String(row.key);

	setAttributes(element, {
		'aria-selected': String(selected),
		'data-active': String(state.managers.navigation.active === row.key),
		'data-event': 'row',
		'data-key': key,
		id: `tabela_${state.id}_row_${key}`,
	});

	element.classList.add('tabela__row--body');

	if (selected) {
		element.classList.add('tabela__row--selected');
	} else {
		element.classList.remove('tabela__row--selected');
	}

	const columns = state.managers.column.items;
	const {length} = columns;

	const data = state.managers.data.values.objects.mapped.get(row.key);

	if (data == null) {
		return;
	}

	for (let index = 0; index < length; index += 1) {
		const {options} = columns[index];

		state.managers.render.pool.cells[options.field] ??= [];

		const cell =
			state.managers.render.pool.cells[columns[index].options.field].shift() ??
			createCell(options.width);

		cell.textContent = String(data[options.field]);

		row.cells[options.field] = cell;

		element.append(cell);
	}
}

export class RowComponent {
	cells: Record<string, HTMLDivElement> = {};

	element: HTMLDivElement | undefined;

	constructor(readonly key: Key) {}
}
