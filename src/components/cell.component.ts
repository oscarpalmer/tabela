import {createCell} from '../helpers/dom.helpers';
import type {Tabela} from '../tabela';
import type {ColumnComponent} from './column.component';
import type {RowComponent} from './row.component';

export class CellComponent {
	readonly element: HTMLDivElement;

	constructor(
		readonly tabela: Tabela,
		readonly column: ColumnComponent,
		readonly row: RowComponent,
	) {
		this.element = createCell(column.options.width);

		this.element.textContent = String(this.row.data[column.options.field]);
	}
}
