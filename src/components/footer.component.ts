import {createCell, createRowGroup} from '../helpers/dom.helpers';
import type {Tabela} from '../tabela';

type Elements = {
	cells: HTMLDivElement[];
	group: HTMLDivElement;
	row: HTMLDivElement;
};

export class FooterComponent {
	readonly elements: Elements;

	constructor(readonly tabela: Tabela) {
		const {group, row} = createRowGroup();

		this.elements = {
			group,
			row,
			cells: [],
		};

		group.className += ' tabela__rowgroup-footer';
		row.className += ' tabela__row-footer';

		const {columns} = tabela.header;
		const {length} = columns;

		for (let index = 0; index < length; index += 1) {
			const cell = createCell(columns[index].options.width ?? 4, false);

			cell.className += ' tabela__cell-footer';
			cell.innerHTML = '&nbsp;';

			this.elements.cells.push(cell);
			row.append(cell);
		}
	}

	destroy(): void {
		this.elements.cells = [];
		this.elements.group = undefined as never;
		this.elements.row = undefined as never;
	}
}
