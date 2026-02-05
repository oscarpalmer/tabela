import {createRowGroup} from '../helpers/dom.helpers';
import type {Tabela} from '../tabela';
import type {ColumnComponent} from './column.component';

type Elements = {
	group: HTMLDivElement;
	row: HTMLDivElement;
};

export class HeaderComponent {
	readonly elements: Elements;

	constructor(readonly tabela: Tabela) {
		const {group, row} = createRowGroup();

		this.elements = {group, row};

		group.className += ' tabela__rowgroup-header';
		row.className += ' tabela__row-header';
	}

	destroy(): void {
		this.elements.group = undefined as never;
		this.elements.row = undefined as never;
	}

	update(columns: ColumnComponent[]): void {
		this.elements.row.innerHTML = '';

		this.elements.row.append(...columns.map(column => column.element));
	}
}
