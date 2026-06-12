import {createRowGroup} from '../helpers/dom.helpers';
import type {HeaderElements} from '../models/header.model';
import {CSS_ROW_HEADER, CSS_ROWGROUP_HEADER} from '../models/style.model';
import type {State} from '../models/tabela.model';
import type {ColumnComponent} from './column.component';

// #region Types

export class HeaderComponent {
	readonly elements: HeaderElements;

	constructor(state: State) {
		const {group, row} = createRowGroup(state);

		row.id = `${state.prefix}_header`;

		this.elements = {group, row};

		group.classList.add(CSS_ROWGROUP_HEADER);
		row.classList.add(CSS_ROW_HEADER);
	}

	destroy(): void {
		this.elements.group = undefined as never;
		this.elements.row = undefined as never;
	}
}

// #endregion

// #region Functions

export function setHeader(state: State, columns: ColumnComponent[]): void {
	const {header} = state.components;

	header.elements.row.innerHTML = '';

	header.elements.row.append(...columns.map(column => column.elements.wrapper));
}

// #endregion
