import {filter} from '@oscarpalmer/atoms/array/filter';
import {select} from '@oscarpalmer/atoms/array/select';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import {getString} from '@oscarpalmer/atoms/string';
import {createElement} from '@oscarpalmer/toretto/create';
import {createColumn} from '../components/column.component';
import {
	columnFooterAggregation,
	type ColumnComponent,
	type ColumnComponentElements,
	type TabelaColumn,
	type TabelaColumnFooterAggregation,
	type TabelaColumnFooterCallback,
	type TabelaColumnLabelCallback,
} from '../models/column.model';
import {
	ARIA_COLCOUNT,
	ATTRIBUTE_DATA_EVENT,
	ATTRIBUTE_DATA_KEY,
	ELEMENT_DIV,
	ROLE_COLUMNHEADER,
} from '../models/dom.model';
import {EVENT_HEADER} from '../models/event.model';
import {
	CSS_HEADING,
	CSS_HEADING_CONTENT,
	CSS_HEADING_RESIZER,
	CSS_HEADING_SORTER,
} from '../models/style.model';
import type {State} from '../models/tabela.model';
import {createFilterElement} from './filter.helper';
import {setFooter} from './footer.helper';
import {setHeader} from './header.helper';
import {removeCells} from './render.helper';
import {updateColumnWidthStyling} from './style.helper';

// #region Functions

export function createColumnElements(
	state: State,
	column: ColumnComponent,
): ColumnComponentElements {
	const id = `${state.prefix}_header_column_${column.key.normalized}`;

	const wrapper = createElement(ELEMENT_DIV, {
		attribute: {
			[ATTRIBUTE_DATA_EVENT]: EVENT_HEADER,
			[ATTRIBUTE_DATA_KEY]: column.key.original,
		},
		property: {
			id,
			className: CSS_HEADING,
			role: ROLE_COLUMNHEADER,
			tabIndex: -1,
		},
		style: {
			width: `${column.options.width}px`,
		},
	});

	const label =
		typeof column.options.label === 'function' ? column.options.label() : column.options.label;

	const content = createElement(ELEMENT_DIV, {
		property: {
			className: CSS_HEADING_CONTENT,
		},
	});

	content.append(...((Array.isArray(label) ? label : [label]) as string[]));

	const filter = createFilterElement(state, column, id);

	const sorter = createElement(ELEMENT_DIV, {
		property: {
			className: CSS_HEADING_SORTER,
		},
	});

	const resizable = createElement('span', {
		aria: {
			hidden: true,
		},
		attribute: {
			'oui-resizable-handle': '',
		},
		property: {
			className: CSS_HEADING_RESIZER,
			hidden: true,
		},
	});

	wrapper.append(content, filter.button, filter.popover, sorter, resizable);

	return {
		content,
		filter,
		sorter,
		wrapper,
	};
}

export function getColumn(state: State, key: string): ColumnComponent | undefined {
	return state.managers.column.items.find(item => item.key.original === key);
}

function getColumnFooter(
	value: unknown,
): TabelaColumnFooterAggregation | TabelaColumnFooterCallback | undefined {
	if (typeof value === 'function') {
		return value as TabelaColumnFooterCallback;
	}

	return columnFooterAggregation.has(value as TabelaColumnFooterAggregation)
		? (value as TabelaColumnFooterAggregation)
		: undefined;
}

function getColumnLabel(value: unknown): string | TabelaColumnLabelCallback | undefined {
	if (typeof value === 'function') {
		return value as TabelaColumnLabelCallback;
	}

	return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

export function getValidColumn(value: unknown): TabelaColumn {
	if (!isPlainObject(value)) {
		throw new TypeError('Column must be a plain object');
	}

	const column = value as TabelaColumn;

	if (typeof column.key !== 'string' || column.key.trim().length === 0) {
		throw new TypeError('Column key must be a non-empty string');
	}

	if (column.render != null && typeof column.render !== 'function') {
		throw new TypeError('Column render must be a function if defined');
	}

	return {
		footer: getColumnFooter(column.footer),
		label: getColumnLabel(column.label) ?? column.key,
		key: column.key,
		render: column.render,
		width:
			typeof column.width === 'number' && !Number.isNaN(column.width) ? column.width : undefined,
	};
}

export function removeColumns(state: State, key: string): void;

export function removeColumns(state: State, keys: string[]): void;

export function removeColumns(state: State, value: unknown): void {
	const {items} = state.managers.column;

	const keys = filter(Array.isArray(value) ? value : [value], item => typeof item === 'string');

	const {length} = keys;

	if (length === 0) {
		return;
	}

	for (let keyIndex = 0; keyIndex < length; keyIndex += 1) {
		const itemIndex = items.findIndex(component => component.key.original === keys[keyIndex]);

		if (itemIndex > -1) {
			items[itemIndex].destroy();

			items.splice(itemIndex, 1);
		}
	}

	setHeader(state, items);
	setFooter(state, items);

	removeCells(state, keys);
}

export function setColumns(state: State, columns: TabelaColumn[]): void {
	const {items, keys} = state.managers.column;

	const validated = select.reverse(columns, getValidColumn, item => item != null);

	if (validated.length === 0) {
		return;
	}

	items.splice(0, items.length, ...validated.map(column => createColumn(state, column)));
	keys.splice(0, keys.length, ...validated.map(column => column.key));

	setHeader(state, items);
	setFooter(state, items);

	state.elements.table.setAttribute(ARIA_COLCOUNT, getString(items.length));

	updateColumnWidthStyling(state);
}

// #endregion
