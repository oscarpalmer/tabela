import {isPlainObject} from '@oscarpalmer/atoms/is';
import {createElement} from '@oscarpalmer/toretto/create';
import {createColumn} from '../components/column.component';
import {
	columnFooters,
	type ColumnComponent,
	type ColumnComponentElements,
	type TabelaColumn,
	type TabelaColumnFooter,
} from '../models/column.model';
import {
	ARIA_COLCOUNT,
	ATTRIBUTE_DATA_EVENT,
	ATTRIBUTE_DATA_KEY,
	ELEMENT_DIV,
	ROLE_COLUMNHEADER,
} from '../models/dom.model';
import {EVENT_HEADER} from '../models/event.model';
import {CSS_HEADING, CSS_HEADING_CONTENT, CSS_HEADING_SORTER} from '../models/style.model';
import type {State} from '../models/tabela.model';
import {setFooter} from './footer.helper';
import {setHeader} from './header.helper';
import {removeCells} from './render.helper';

// #region Functions

export function createHeading(
	state: State,
	column: ColumnComponent,
	width: number,
): ColumnComponentElements {
	const wrapper = createElement(ELEMENT_DIV, {
		attribute: {
			[ATTRIBUTE_DATA_EVENT]: EVENT_HEADER,
			[ATTRIBUTE_DATA_KEY]: column.options.key,
		},
		property: {
			className: CSS_HEADING,
			id: `${state.prefix}_header_column_${column.options.key}`,
			role: ROLE_COLUMNHEADER,
			tabIndex: -1,
		},
		style: {
			flex: `0 0 ${width}px`,
		},
	});

	const content = createElement(ELEMENT_DIV, {
		property: {
			className: CSS_HEADING_CONTENT,
			textContent: column.options.label,
		},
	});

	const sorter = createElement(ELEMENT_DIV, {
		property: {
			className: CSS_HEADING_SORTER,
		},
	});

	wrapper.append(content, sorter);

	return {content, sorter, wrapper};
}

export function getColumn(state: State, key: string): ColumnComponent | undefined {
	return state.managers.column.items.find(item => item.options.key === key);
}

function getColumnFooter(value: unknown): TabelaColumnFooter | undefined {
	return columnFooters.has(value as TabelaColumnFooter) ? (value as TabelaColumnFooter) : undefined;
}

export function getValidColumn(value: unknown): TabelaColumn | undefined {
	if (!isPlainObject(value)) {
		return;
	}

	const column = value as TabelaColumn;

	if (typeof column.key !== 'string' || column.key.trim().length === 0) {
		return;
	}

	return {
		footer: getColumnFooter(column.footer),
		label:
			typeof column.label === 'string' && column.label.trim().length > 0
				? column.label
				: column.key,
		key: column.key,
		width:
			typeof column.width === 'number' && !Number.isNaN(column.width) ? column.width : undefined,
	};
}

export function removeColumns(state: State, key: string): void;

export function removeColumns(state: State, keys: string[]): void;

export function removeColumns(state: State, value: unknown): void {
	const {items} = state.managers.column;

	const keys = (Array.isArray(value) ? value : [value]).filter(item => typeof item === 'string');

	const {length} = keys;

	if (length === 0) {
		return;
	}

	for (let keyIndex = 0; keyIndex < length; keyIndex += 1) {
		const itemIndex = items.findIndex(component => component.options.key === keys[keyIndex]);

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

	const validated = columns.map(getValidColumn).filter(item => item != null);

	if (validated.length === 0) {
		return;
	}

	items.splice(0, items.length, ...validated.map(column => createColumn(state, column)));
	keys.splice(0, keys.length, ...validated.map(column => column.key));

	setHeader(state, items);
	setFooter(state, items);

	state.elements.table.setAttribute(ARIA_COLCOUNT, String(items.length));
}

// #endregion
