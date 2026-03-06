import {createElement} from '../helpers/dom.helpers';
import type {TabelaColumn, TabelaColumnOptions} from '../models/column.model';

function createHeading(title: string, width: number): HTMLDivElement {
	const cell = createElement(
		'div',
		{
			className: 'tabela__heading',
			role: 'columnheader',
			textContent: title,
		},
		{
			width: `${width}px`,
		},
	);

	return cell;
}

export class ColumnComponent {
	readonly element: HTMLDivElement;
	readonly options: TabelaColumn;

	constructor(options: TabelaColumnOptions) {
		const width =
			Number.parseInt(getComputedStyle(document.body).fontSize, 10) *
			(options.width ?? options.title.length * 1.5);

		this.options = {
			...options,
			width,
		};

		this.element = createHeading(options.title, width);
	}
}
