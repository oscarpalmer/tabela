import {createCell, createRowGroup} from '../helpers/dom.helpers';
import type {FooterElements} from '../models/footer.model';
import type {ColumnComponent} from './column.component';

export class FooterComponent {
	readonly elements: FooterElements;

	constructor() {
		const {group, row} = createRowGroup();

		this.elements = {
			group,
			row,
			cells: [],
		};

		group.className += ' tabela__rowgroup-footer';
		row.className += ' tabela__row-footer';
	}

	destroy(): void {
		this.elements.cells.length = 0;

		this.elements.group = undefined as never;
		this.elements.row = undefined as never;
	}

	update(columns: ColumnComponent[]): void {
		const {elements} = this;
		const {length} = columns;

		elements.cells.length = 0;
		elements.row.innerHTML = '';

		for (let index = 0; index < length; index += 1) {
			const cell = createCell(columns[index].options.width ?? 4, false);

			cell.className += ' tabela__cell-footer';
			cell.innerHTML = '&nbsp;';

			elements.cells.push(cell);
			elements.row.append(cell);
		}
	}
}
