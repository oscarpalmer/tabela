import {createCell, createRowGroup} from '../helpers/dom.helpers';
import type {FooterElements} from '../models/footer.model';
import {
	CSS_CELL_FOOTER,
	CSS_ROW_FOOTER,
	CSS_ROWGROUP_FOOTER,
} from '../models/style.model';
import type {State} from '../models/tabela.model';
import type {ColumnComponent} from './column.component';

export class FooterComponent {
	readonly elements: FooterElements;

	constructor(state: State) {
		const {group, row} = createRowGroup(state.options.rowHeight);

		this.elements = {
			group,
			row,
			cells: [],
		};

		group.className += ` ${CSS_ROWGROUP_FOOTER}`;
		row.className += ` ${CSS_ROW_FOOTER}`;
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

			cell.className += ` ${CSS_CELL_FOOTER}`;
			cell.innerHTML = '&nbsp;';

			elements.cells.push(cell);
			elements.row.append(cell);
		}
	}
}
