import {setAttributes} from '@oscarpalmer/toretto/attribute';
import {setStyles} from '@oscarpalmer/toretto/style';

type RowGroupWithRow = {
	group: HTMLDivElement;
	row: HTMLDivElement;
};

export function createCell(width: number, body?: boolean): HTMLDivElement {
	const cell = createElement(
		'div',
		{
			className: 'tabela__cell',
			role: 'cell',
		},
		{},
		{
			width: `${width}px`,
		},
	);

	if (body ?? true) {
		cell.classList.add('tabela__cell-body');
	}

	return cell;
}

export function createElement<TagName extends keyof HTMLElementTagNameMap>(
	tagName: TagName,
	properties: Partial<HTMLElementTagNameMap[TagName]>,
	attributes: Record<string, string>,
	style: Partial<CSSStyleDeclaration>,
): HTMLElementTagNameMap[TagName] {
	const element = document.createElement(tagName);

	const keys = Object.keys(properties);

	for (const key of keys) {
		(element as any)[key] = properties[key as keyof typeof properties];
	}

	setAttributes(element, attributes);
	setStyles(element, style);

	return element;
}

export function createRowGroup(): RowGroupWithRow;

export function createRowGroup(withRow: boolean): HTMLDivElement;

export function createRowGroup(withRow?: boolean) {
	const group = createElement(
		'div',
		{
			className: 'tabela__rowgroup',
			role: 'rowgroup',
		},
		{},
		{},
	);

	if (!(withRow ?? true)) {
		return group;
	}

	const row = createRow(false);

	group.append(row);

	return {group, row};
}

export function createRow(withStyle?: boolean): HTMLDivElement {
	const row = createElement(
		'div',
		{
			className: 'tabela__row',
			role: 'row',
		},
		{},
		{},
	);

	if (withStyle ?? true) {
		setStyles(row, {
			inset: '0 auto auto 0',
			position: 'absolute',
		});
	}

	return row;
}
