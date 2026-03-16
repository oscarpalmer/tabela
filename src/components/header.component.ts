import {createRowGroup} from '../helpers/dom.helpers';
import type {HeaderElements} from '../models/header.model';
import {CSS_ROW_HEADER, CSS_ROWGROUP_HEADER} from '../models/style.model';
import type {State} from '../models/tabela.model';
import type {ColumnComponent} from './column.component';

export class HeaderComponent {
	readonly elements: HeaderElements;

	constructor(state: State) {
		const {group, row} = createRowGroup(state.options.rowHeight);

		this.elements = {group, row};

		group.className += ` ${CSS_ROWGROUP_HEADER}`;
		row.className += ` ${CSS_ROW_HEADER}`;
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
