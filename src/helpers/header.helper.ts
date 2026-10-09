import type {ColumnComponent} from '../models/column.model';
import type {State} from '../models/tabela.model';

// #region Functions

export function setHeader(state: State, columns: ColumnComponent[]): void {
	const {header} = state.components;

	header.elements.row.innerHTML = '';

	header.elements.row.append(...columns.map(column => column.elements.wrapper));
}

// #endregion
