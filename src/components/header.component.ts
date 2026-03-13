import {createRowGroup} from '../helpers/dom.helpers';
import type {HeaderElements} from '../models/header.model';
import {CSS_TABELA_ROW_HEADER, CSS_TABELA_ROWGROUP_HEADER} from '../models/style.model';
import type {ColumnComponent} from './column.component';

export class HeaderComponent {
	readonly elements: HeaderElements;

	constructor() {
		const {group, row} = createRowGroup();

		this.elements = {group, row};

		group.className += ` ${CSS_TABELA_ROWGROUP_HEADER}`;
		row.className += ` ${CSS_TABELA_ROW_HEADER}`;
	}

	destroy(): void {
		this.elements.group = undefined as never;
		this.elements.row = undefined as never;
	}

	update(columns: ColumnComponent[]): void {
		this.elements.row.innerHTML = '';

		this.elements.row.append(...columns.map(column => column.elements.wrapper));
	}
}
