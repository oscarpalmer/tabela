import {createElement} from '@oscarpalmer/toretto/create';
import {
	columnFooterAggregation,
	type ColumnComponent,
	type ColumnComponentElements,
	type TabelaColumnFooterAggregation,
	type TabelaColumnFooterCallback,
	type TabelaColumnLabelCallback,
} from '../../models/column.model';
import {
	ATTRIBUTE_DATA_EVENT,
	ATTRIBUTE_DATA_KEY,
	ELEMENT_DIV,
	ROLE_COLUMNHEADER,
} from '../../models/dom.model';
import {EVENT_HEADER} from '../../models/event.model';
import {
	CSS_HEADING,
	CSS_HEADING_CONTENT,
	CSS_HEADING_RESIZER,
	CSS_HEADING_SORTER,
} from '../../models/style.model';
import type {State} from '../../models/tabela.model';
import {createFilterElement} from '../filter/filter.dom';

// #region Functions

export function createColumnElements(
	state: State,
	column: ColumnComponent,
): ColumnComponentElements {
	const {options} = column;

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

	const label = typeof options.label === 'function' ? options.label() : options.label;

	const content = createElement(ELEMENT_DIV, {
		property: {
			className: CSS_HEADING_CONTENT,
		},
	});

	content.append(...((Array.isArray(label) ? label : [label]) as string[]));

	const filter = createFilterElement(state, column, id);

	let sorter: HTMLDivElement | undefined;

	if (state.managers.sort.enabled && column.options.sortable) {
		sorter = createElement(ELEMENT_DIV, {
			property: {
				className: CSS_HEADING_SORTER,
			},
		});

		wrapper.classList.add(`${CSS_HEADING}--sortable`);
	}

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

	wrapper.append(content);

	if (filter != null) {
		wrapper.append(filter.button, filter.popover);
	}

	if (sorter != null) {
		wrapper.append(sorter);
	}

	wrapper.append(resizable);

	return {
		content,
		filter,
		sorter,
		wrapper,
	};
}

export function getColumnFooter(
	value: unknown,
): TabelaColumnFooterAggregation | TabelaColumnFooterCallback | undefined {
	if (typeof value === 'function') {
		return value as TabelaColumnFooterCallback;
	}

	return columnFooterAggregation.has(value as TabelaColumnFooterAggregation)
		? (value as TabelaColumnFooterAggregation)
		: undefined;
}

export function getColumnLabel(value: unknown): string | TabelaColumnLabelCallback | undefined {
	if (typeof value === 'function') {
		return value as TabelaColumnLabelCallback;
	}

	return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

// #endregion
