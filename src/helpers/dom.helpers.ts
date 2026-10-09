import {createElement} from '@oscarpalmer/toretto/create';
import {ELEMENT_DIV, ROLE_CELL, ROLE_ROW, ROLE_ROWGROUP} from '../models/dom.model';
import {CSS_CELL, CSS_CELL_BODY, CSS_ROW, CSS_ROWGROUP} from '../models/style.model';
import type {State} from '../models/tabela.model';

// #region Types

type RowGroupWithRow = {
	group: HTMLDivElement;
	row: HTMLDivElement;
};

// #endregion

// #region Functions

export function createCellElement(width: number, body?: boolean): HTMLDivElement {
	const cell = createElement(ELEMENT_DIV, {
		property: {
			className: CSS_CELL,
			role: ROLE_CELL,
			tabIndex: -1,
		},
		style: {
			flex: `0 0 ${width}px`,
		},
	});

	if (body ?? true) {
		cell.classList.add(CSS_CELL_BODY);
	}

	return cell;
}

export function createRowGroupElement(state: State): RowGroupWithRow;

export function createRowGroupElement(state: State, withRow: boolean): HTMLDivElement;

export function createRowGroupElement(state: State, withRow?: boolean) {
	const group = createElement(ELEMENT_DIV, {
		property: {
			className: CSS_ROWGROUP,
			role: ROLE_ROWGROUP,
		},
	});

	if (!(withRow ?? true)) {
		return group;
	}

	const row = createRowElement(state.options.rowHeight);

	group.append(row);

	return {group, row};
}

export function createRowElement(height: number): HTMLDivElement {
	const row = createElement(ELEMENT_DIV, {
		property: {
			className: CSS_ROW,
			role: ROLE_ROW,
		},
		style: {
			height: `${height}px`,
		},
	});

	return row;
}

// #endregion
