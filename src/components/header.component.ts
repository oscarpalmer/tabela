import {createRowGroup} from '../helpers/dom.helpers';
import type {HeaderElements} from '../models/header.model';
import type {ColumnComponent} from './column.component';

export class HeaderComponent {
	readonly elements: HeaderElements;

	constructor() {
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
