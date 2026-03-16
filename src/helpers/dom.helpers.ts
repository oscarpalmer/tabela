import {setAttributes} from '@oscarpalmer/toretto/attribute';
import {setStyles} from '@oscarpalmer/toretto/style';
import {
	CSS_CELL,
	CSS_CELL_BODY,
	CSS_ROW,
	CSS_ROWGROUP,
} from '../models/style.model';
import {ELEMENT_DIV, ROLE_CELL, ROLE_ROW, ROLE_ROWGROUP} from '../models/dom.model';

type RowGroupWithRow = {
	group: HTMLDivElement;
	row: HTMLDivElement;
};

export function createCell(width: number, body?: boolean): HTMLDivElement {
	const cell = createElement(
		ELEMENT_DIV,
		{
			className: CSS_CELL,
			role: ROLE_CELL,
		},
		{},
		{
			width: `${width}px`,
		},
	);

	if (body ?? true) {
		cell.classList.add(CSS_CELL_BODY);
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

export function createRowGroup(height: number): RowGroupWithRow;

export function createRowGroup(height: number, withRow: boolean): HTMLDivElement;

export function createRowGroup(height: number, withRow?: boolean) {
	const group = createElement(ELEMENT_DIV, {
		className: CSS_ROWGROUP,
		role: ROLE_ROWGROUP,
	});

	if (!(withRow ?? true)) {
		return group;
	}

	const row = createRow(height);

	group.append(row);

	return {group, row};
}

export function createRow(height: number): HTMLDivElement {
	const row = createElement(
		ELEMENT_DIV,
		{
			className: CSS_ROW,
			role: ROLE_ROW,
		},
		{},
		{
			height: `${height}px`,
		},
	);

	return row;
}
