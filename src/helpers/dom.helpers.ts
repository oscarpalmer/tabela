import {createElement} from '@oscarpalmer/toretto/create';
import {
	ARIA_LABEL,
	ARIA_ROWCOUNT,
	ATTRIBUTE_DATA_EVENT,
	ELEMENT_DIV,
	ROLE_CELL,
	ROLE_GRID,
	ROLE_ROW,
	ROLE_ROWGROUP,
} from '../models/dom.model';
import type {Options} from '../models/options.model';
import {CSS_CELL, CSS_CELL_BODY, CSS_ROW, CSS_ROWGROUP, CSS_TABLE} from '../models/style.model';
import type {State} from '../models/tabela.model';

// #region Types

type RowGroupWithRow = {
	group: HTMLDivElement;
	row: HTMLDivElement;
};

// #endregion

// #region Functions

export function createCellElement(key: string, body?: boolean): HTMLDivElement {
	const cell = createElement(ELEMENT_DIV, {
		property: {
			className: CSS_CELL,
			role: ROLE_CELL,
			tabIndex: -1,
		},
		style: {
			flex: `0 0 var(--tabela-width-${key})`,
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

export function createTable(options: Options): HTMLDivElement {
	return createElement(ELEMENT_DIV, {
		attribute: {
			[ARIA_LABEL]: options.label,
			[ARIA_ROWCOUNT]: '0',
			[ATTRIBUTE_DATA_EVENT]: 'table',
		},
		property: {
			className: CSS_TABLE,
			role: ROLE_GRID,
		},
	});
}

// #endregion
