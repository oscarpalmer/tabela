import type {TabelaColumn, TabelaColumnOptions} from '../models/column.model';
import type {Tabela} from '../tabela';

function createElement(title: string, width: number): HTMLDivElement {
	const cell = document.createElement('div');

	cell.className = 'tabela__heading';
	cell.role = 'columnheader';
	cell.style.width = `${width}px`;
	cell.textContent = title;

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

		this.element = createElement(options.title, width);
	}
}
