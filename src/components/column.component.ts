import {createElement} from '../helpers/dom.helpers';
import type {Column, TabelaColumn} from '../models/column.model';

export class ColumnComponent {
	elements: ColumnElements;
	options: Column;

	constructor(column: TabelaColumn) {
		const width =
			Number.parseInt(getComputedStyle(document.body).fontSize, 10) *
			(column.width ?? column.title.length * 1.5);

		this.options = {
			...column,
			width,
		};

		this.elements = createHeading(this.options.field, this.options.title, width);
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

function createHeading(field: string, title: string, width: number): ColumnElements {
	const wrapper = createElement(
		'div',
		{
			className: 'tabela__heading',
			role: 'columnheader',
		},
		{
			'data-event': 'heading',
			'data-field': field,
		},
		{
			width: `${width}px`,
		},
	);

	const content = createElement(
		'div',
		{
			className: 'tabela__heading__content',
			textContent: title,
		},
		{},
		{},
	);

	const sorter = createElement(
		'div',
		{
			className: 'tabela__heading__sorter',
		},
		{},
		{},
	);

	wrapper.append(content, sorter);

	return {content, sorter, wrapper};
}
