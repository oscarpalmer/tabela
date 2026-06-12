import {createElement} from '../helpers/dom.helpers';
import type {Column, TabelaColumn} from '../models/column.model';
import {
	ATTRIBUTE_DATA_EVENT,
	ATTRIBUTE_DATA_KEY,
	ATTRIBUTE_ROLE,
	ELEMENT_DIV,
	ROLE_COLUMNHEADER,
} from '../models/dom.model';
import {EVENT_HEADER} from '../models/event.model';
import {CSS_HEADING, CSS_HEADING_CONTENT, CSS_HEADING_SORTER} from '../models/style.model';
import type {State} from '../models/tabela.model';

// #region Types

export class ColumnComponent {
	elements: ColumnElements;
	options: Column;

	constructor(state: State, column: TabelaColumn) {
		const width =
			Number.parseInt(getComputedStyle(document.body).fontSize, 10) *
			(column.width ?? (column.label?.length ?? column.key?.length) * 1.5);

		this.options = {
			width,
			footer: column.footer,
			key: column.key,
			label: column.label ?? column.key,
		};

		this.elements = createHeading(state, this, width);
	}

	destroy(): void {
		this.elements.content.remove();
		this.elements.wrapper.remove();
		this.elements.sorter.remove();

		this.elements = undefined as never;
		this.options = undefined as never;
	}
}

type ColumnElements = {
	content: HTMLDivElement;
	sorter: HTMLDivElement;
	wrapper: HTMLDivElement;
};

// #endregion

// #region Functions

function createHeading(state: State, column: ColumnComponent, width: number): ColumnElements {
	const wrapper = createElement(
		ELEMENT_DIV,
		{
			[ATTRIBUTE_ROLE]: ROLE_COLUMNHEADER,
			className: CSS_HEADING,
			id: `${state.prefix}_header_column_${column.options.key}`,
			tabIndex: -1,
		},
		{
			[ATTRIBUTE_DATA_EVENT]: EVENT_HEADER,
			[ATTRIBUTE_DATA_KEY]: column.options.key,
		},
		{
			flex: `0 0 ${width}px`,
		},
	);

	const content = createElement(ELEMENT_DIV, {
		className: CSS_HEADING_CONTENT,
		textContent: column.options.label,
	});

	const sorter = createElement(ELEMENT_DIV, {
		className: CSS_HEADING_SORTER,
	});

	wrapper.append(content, sorter);

	return {content, sorter, wrapper};
}

// #endregion
