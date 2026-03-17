import {createElement} from '../helpers/dom.helpers';
import type {Column, TabelaColumn} from '../models/column.model';
import {
	ATTRIBUTE_DATA_EVENT,
	ATTRIBUTE_DATA_KEY,
	ATTRIBUTE_ROLE,
	ELEMENT_DIV,
	ROLE_COLUMNHEADER,
} from '../models/dom.model';
import {EVENT_HEADING} from '../models/event.model';
import {CSS_HEADING, CSS_HEADING_CONTENT, CSS_HEADING_SORTER} from '../models/style.model';

export class ColumnComponent {
	elements: ColumnElements;
	options: Column;

	constructor(column: TabelaColumn) {
		const width =
			Number.parseInt(getComputedStyle(document.body).fontSize, 10) *
			(column.width ?? column.label.length * 1.5);

		this.options = {
			...column,
			width,
		};

		this.elements = createHeading(this.options.key, this.options.label, width);
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

function createHeading(key: string, title: string, width: number): ColumnElements {
	const wrapper = createElement(
		ELEMENT_DIV,
		{
			className: CSS_HEADING,
			[ATTRIBUTE_ROLE]: ROLE_COLUMNHEADER,
		},
		{
			[ATTRIBUTE_DATA_EVENT]: EVENT_HEADING,
			[ATTRIBUTE_DATA_KEY]: key,
		},
		{
			width: `${width}px`,
		},
	);

	const content = createElement(ELEMENT_DIV, {
		className: CSS_HEADING_CONTENT,
		textContent: title,
	});

	const sorter = createElement(ELEMENT_DIV, {
		className: CSS_HEADING_SORTER,
	});

	wrapper.append(content, sorter);

	return {content, sorter, wrapper};
}
