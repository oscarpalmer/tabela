import {createElement} from '../helpers/dom.helpers';
import type {TabelaColumn, TabelaColumnOptions} from '../models/column.model';
import type {Tabela} from '../tabela';

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

	constructor(
		readonly tabela: Tabela,
		options: TabelaColumnOptions,
	) {
		const width =
			Number.parseInt(getComputedStyle(tabela.element).fontSize, 10) *
			(options.width ?? options.title.length * 1.5);

		this.options = {
			...options,
			width,
		};

		this.element = createHeading(options.title, width);
	}
}
