import {createCell, createRowGroup} from '../helpers/dom.helpers';
import type {Tabela} from '../tabela';

export class FooterComponent {
	readonly cells: HTMLDivElement[] = [];
	readonly group: HTMLDivElement;
	readonly row: HTMLDivElement;

	constructor(readonly tabela: Tabela) {
		const {group, row} = createRowGroup();

		this.group = group;
		this.row = row;

		this.group.className += ' tabela__rowgroup-footer';
		this.row.className += ' tabela__row-footer';

		const {columns} = tabela.header;
		const {length} = columns;

		for (let index = 0; index < length; index += 1) {
			const cell = createCell(columns[index].options.width ?? 4);

			cell.className += ' tabela__cell-footer';
			cell.innerHTML = '&nbsp;';

			this.cells.push(cell);
			row.append(cell);
		}
	}
}
