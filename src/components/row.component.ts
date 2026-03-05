import type {Key} from '@oscarpalmer/atoms/models';
import {createCell, createRow} from '../helpers/dom.helpers';
import type {VirtualizationPool} from '../models/virtualization.model';
import type {Tabela} from '../tabela';

export function removeRow(row: RowComponent, pool: VirtualizationPool): void {
	if (row.element != null) {
		row.element.innerHTML = '';

		pool.rows.push(row.element);
		row.element.remove();

		row.element = undefined;
	}

	row.cells = {};
}

export function renderRow(tabela: Tabela, pool: VirtualizationPool, row: RowComponent): void {
	const element = row.element ?? pool.rows.shift() ?? createRow();

	row.element = element;

	element.dataset.key = String(row.key);
	element.innerHTML = '';

	const columns = tabela.managers.columns.components;
	const {length} = columns;

	const data = tabela.managers.data.values.objects.mapped.get(row.key);

	if (data == null) {
		return;
	}

	for (let index = 0; index < length; index += 1) {
		const {options} = columns[index];

		pool.cells[options.field] ??= [];

		const cell = pool.cells[columns[index].options.field].shift() ?? createCell(options.width);

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
