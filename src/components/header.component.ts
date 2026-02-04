import {createRowGroup} from '../helpers/dom.helpers';
import type {Tabela} from '../tabela';
import {ColumnComponent} from './column.component';

type Elements = {
	group: HTMLDivElement;
	row: HTMLDivElement;
};

export class HeaderComponent {
	readonly columns: ColumnComponent[];
	readonly elements: Elements;

	constructor(readonly tabela: Tabela) {
		this.columns = tabela.options.columns.map(column => new ColumnComponent(tabela, column));

		const {group, row} = createRowGroup();

		this.elements = {group, row};

		group.className += ' tabela__rowgroup-header';
		row.className += ' tabela__row-header';

		row.append(...this.columns.map(column => column.element));
	}

	destroy(): void {
		this.columns.length = 0;
		this.elements.group = undefined as never;
		this.elements.row = undefined as never;
	}
}
