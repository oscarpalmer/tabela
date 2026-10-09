import {createElement} from '@oscarpalmer/toretto/create';
import type {
	Column,
	ColumnComponent,
	ColumnComponentElements,
	TabelaColumn,
} from '../models/column.model';
import {
	ATTRIBUTE_DATA_EVENT,
	ATTRIBUTE_DATA_KEY,
	ELEMENT_DIV,
	ROLE_COLUMNHEADER,
} from '../models/dom.model';
import {EVENT_HEADER} from '../models/event.model';
import {CSS_HEADING, CSS_HEADING_CONTENT, CSS_HEADING_SORTER} from '../models/style.model';
import type {State} from '../models/tabela.model';

// #region Instances

function ColumnComponent(this: ColumnComponent, state: State, column: TabelaColumn): void {
	const width =
		Number.parseInt(getComputedStyle(document.body).fontSize, 10) *
		(column.width ?? (column.label?.length ?? column.key?.length) * 1.5);

	this.options = {
		width,
		footer: column.footer,
		key: column.key,
		label: column.label ?? column.key,
	} as Column;

	this.elements = createHeading(state, this, width);
}

ColumnComponent.prototype.destroy = destroyColumn;

// #endregion

// #region Functions

export function createColumn(state: State, column: TabelaColumn): ColumnComponent {
	// @ts-expect-error All good, no worries :-)
	return new ColumnComponent(state, column);
}

function createHeading(
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

function destroyColumn(this: ColumnComponent): void {
	this.elements.content.remove();
	this.elements.wrapper.remove();
	this.elements.sorter.remove();

	this.elements = undefined as never;
	this.options = undefined as never;
}

// #endregion
