import type {PlainObject} from '@oscarpalmer/atoms/models';
import {createRow} from '../helpers/dom.helpers';
import type {Tabela} from '../tabela';
import {CellComponent} from './cell.component';

export class RowComponent {
	readonly cells: CellComponent[] = [];
	readonly element: HTMLDivElement;

	constructor(
		readonly tabela: Tabela,
		readonly data: PlainObject,
	) {
		this.element = createRow();

		this.element.className += ' tabela__row-body';

		const {columns} = tabela.header;
		const {length} = columns;

		for (let index = 0; index < length; index += 1) {
			const cell = new CellComponent(tabela, columns[index], this);

			cell.element.className += ' tabela__cell-body';

			this.cells.push(cell);
			this.element.append(cell.element);
		}
	}
}
