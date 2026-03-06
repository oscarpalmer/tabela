import type {Key} from '@oscarpalmer/atoms/models';
import {createCell, createRow} from '../helpers/dom.helpers';
import type {TabelaManagers} from '../models/tabela.model';
import type {VirtualizationPool} from '../models/virtualization.model';

export function removeRow(pool: VirtualizationPool, row: RowComponent): void {
	if (row.element != null) {
		row.element.innerHTML = '';

		pool.rows.push(row.element);
		row.element.remove();

		row.element = undefined;
	}

	row.cells = {};
}

export function renderRow(managers: TabelaManagers, row: RowComponent): void {
	const element = row.element ?? managers.virtualization.pool.rows.shift() ?? createRow();

	row.element = element;

	element.dataset.key = String(row.key);
	element.innerHTML = '';

	const columns = managers.column.items;
	const {length} = columns;

	const data = managers.data.values.objects.mapped.get(row.key);

	if (data == null) {
		return;
	}

	for (let index = 0; index < length; index += 1) {
		const {options} = columns[index];

		managers.virtualization.pool.cells[options.field] ??= [];

		const cell =
			managers.virtualization.pool.cells[columns[index].options.field].shift() ??
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
