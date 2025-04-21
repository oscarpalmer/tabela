import type {PlainObject} from '@oscarpalmer/atoms/models';
import {createCell, createRow} from '../helpers/dom.helpers';
import type {ElementPool} from '../managers/virtualization.manager';
import type {Tabela} from '../tabela';

export class RowComponent {
	element: HTMLDivElement | undefined;

	constructor(
		readonly tabela: Tabela,
		readonly data: PlainObject,
	) {}

	remove(pool: ElementPool): void {
		if (this.element != null) {
			this.element.innerHTML = '';

			pool.rows.push(this.element);
			this.element.remove();

			this.element = undefined;
		}
	}

	render(pool: ElementPool): void {
		const element = this.element ?? pool.rows.shift() ?? createRow();

		this.element = element;

		element.innerHTML = '';

		const {tabela} = this;
		const {columns} = tabela.header;
		const {length} = columns;

		for (let index = 0; index < length; index += 1) {
			const {options} = columns[index];

			pool.cells[options.field] ??= [];

			const cell =
				pool.cells[columns[index].options.field].shift() ??
				createCell(options.width);

			cell.textContent = String(this.data[options.field]);

			element.append(cell);
		}
	}
}
