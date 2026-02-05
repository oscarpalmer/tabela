import type {Key} from '@oscarpalmer/atoms/models';
import {createCell, createRow} from '../helpers/dom.helpers';
import type {ElementPool} from '../managers/virtualization.manager';
import type {Tabela} from '../tabela';

export function removeRow(row: RowComponent, pool: ElementPool): void {
	if (row.element != null) {
		row.element.innerHTML = '';

		pool.rows.push(row.element);
		row.element.remove();

		row.element = undefined;
	}
}

export function renderRow(tabela: Tabela, pool: ElementPool, row: RowComponent): void {
	const element = row.element ?? pool.rows.shift() ?? createRow();

	row.element = element;

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

		element.append(cell);
	}
}

export class RowComponent {
	element: HTMLDivElement | undefined;

	constructor(readonly key: Key) {}
}
