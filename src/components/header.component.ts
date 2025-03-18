import {createRowGroup} from '../helpers/dom.helpers';
import type {Tabela} from '../tabela';
import {ColumnComponent} from './column.component';

export class HeaderComponent {
	readonly columns: ColumnComponent[];
	readonly group: HTMLDivElement;
	readonly row: HTMLDivElement;

	constructor(readonly tabela: Tabela) {
		this.columns = tabela.options.columns.map(
			column => new ColumnComponent(tabela, column),
		);

		const {group, row} = createRowGroup();

		this.group = group;
		this.row = row;

		this.group.className += ' tabela__rowgroup-header';
		this.row.className += ' tabela__row-header';

		row.append(...this.columns.map(column => column.element));
	}
}
