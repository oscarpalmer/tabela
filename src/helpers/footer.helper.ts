import {unique} from '@oscarpalmer/atoms/array';
import {average, max, median, min, sum} from '@oscarpalmer/atoms/math';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {ColumnComponent, TabelaColumn, TabelaColumnFooter} from '../models/column.model';
import type {FooterComponent} from '../models/footer.model';
import {CSS_CELL_FOOTER} from '../models/style.model';
import type {State} from '../models/tabela.model';
import {createCellElement} from './dom.helpers';

// #region Functions

function getCell(footer: FooterComponent, column: ColumnComponent): HTMLDivElement {
	const cell = createCellElement(column.options.width, false);

	cell.id = `${footer.elements.row.id}_column_${column.options.key}`;

	cell.classList.add(CSS_CELL_FOOTER);

	return cell;
}

function getContent(column: ColumnComponent, data: PlainObject[]): string {
	if (data.length === 0 || column.options.footer == null) {
		return empty;
	}

	const handler = handlers[column.options.footer];

	if (handler == null) {
		return empty;
	}

	const value = handler(column.options, data);

	return Number.isNaN(Number(value)) ? empty : String(value);
}

export function renderFooter(state: State, columns: ColumnComponent[], set: boolean): void {
	const {footer} = state.components;

	if (footer.hidden) {
		return;
	}

	const {elements} = footer;
	const {length} = columns;

	if (set) {
		elements.cells.length = 0;
		elements.row.innerHTML = '';
	}

	const data = state?.managers?.data?.get?.(true) ?? [];

	for (let index = 0; index < length; index += 1) {
		const column = columns[index];

		const cell = elements.cells[index] ?? getCell(footer, column);

		if (!set && column.options.footer == null) {
			continue;
		}

		cell.innerHTML = getContent(column, data);

		if (set) {
			elements.cells.push(cell);
			elements.row.append(cell);
		}
	}
}

export function setFooter(state: State, columns: ColumnComponent[]): void {
	renderFooter(state, columns, true);
}

export function updateFooter(state: State): void {
	renderFooter(state, state.managers.column.items, false);
}

// #endregion

// #region Variables

const empty = '&nbsp;';

const handlers: Record<
	TabelaColumnFooter,
	(column: TabelaColumn, values: PlainObject[]) => number
> = {
	average: (column, values) => average(values, item => item[column.key] as number),
	count: (_, values) => values.length,
	max: (column, values) => max(values, item => item[column.key] as number),
	median: (column, values) => median(values, item => item[column.key] as number),
	min: (column, values) => min(values, item => item[column.key] as number),
	sum: (column, values) => sum(values, item => item[column.key] as number),
	unique: (column, values) => unique(values.map(item => item[column.key])).length,
};

// #endregion
