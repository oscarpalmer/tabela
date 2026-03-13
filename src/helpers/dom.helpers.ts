import {setAttributes} from '@oscarpalmer/toretto/attribute';
import {setStyles} from '@oscarpalmer/toretto/style';
import {
	CSS_TABELA_CELL,
	CSS_TABELA_CELL_BODY,
	CSS_TABELA_ROW,
	CSS_TABELA_ROWGROUP,
} from '../models/style.model';

type RowGroupWithRow = {
	group: HTMLDivElement;
	row: HTMLDivElement;
};

export function createCell(width: number, body?: boolean): HTMLDivElement {
	const cell = createElement(
		'div',
		{
			className: CSS_TABELA_CELL,
			role: 'cell',
		},
		{},
		{
			width: `${width}px`,
		},
	);

	if (body ?? true) {
		cell.classList.add(CSS_TABELA_CELL_BODY);
	}

	return cell;
}

export function createElement<TagName extends keyof HTMLElementTagNameMap>(
	tagName: TagName,
	properties?: Partial<HTMLElementTagNameMap[TagName]>,
	attributes?: Record<string, string>,
	style?: Partial<CSSStyleDeclaration>,
): HTMLElementTagNameMap[TagName] {
	const element = document.createElement(tagName);

	const props = properties ?? {};
	const keys = Object.keys(props);

	for (const key of keys) {
		(element as any)[key] = props[key as keyof typeof props];
	}

	setAttributes(element, attributes ?? {});
	setStyles(element, style ?? {});

	return element;
}

export function createRowGroup(): RowGroupWithRow;

export function createRowGroup(withRow: boolean): HTMLDivElement;

export function createRowGroup(withRow?: boolean) {
	const group = createElement(
		'div',
		{
			className: CSS_TABELA_ROWGROUP,
			role: 'rowgroup',
		},
		{},
		{},
	);

	if (!(withRow ?? true)) {
		return group;
	}

	const row = createRow();

	group.append(row);

	return {group, row};
}

export function createRow(): HTMLDivElement {
	const row = createElement(
		'div',
		{
			className: CSS_TABELA_ROW,
			role: 'row',
		},
		{},
		{
			height: '32px',
		},
	);

	return row;
}
