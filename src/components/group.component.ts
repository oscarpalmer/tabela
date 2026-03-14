import {getString} from '@oscarpalmer/atoms/string';
import {createElement} from '../helpers/dom.helpers';
import type {GroupValue} from '../models/group.model';
import {CSS_TABELA_ROW, CSS_TABELA_ROW_GROUP} from '../models/style.model';
import type {State} from '../models/tabela.model';

export class GroupComponent {
	element: HTMLElement | undefined;

	expanded = true;

	filtered = 0;

	readonly key: string;

	selected = 0;

	total = 0;

	readonly value: GroupValue;

	constructor(
		readonly label: string,
		value: unknown,
	) {
		const stringified = getString(value);

		this.key = `group:${stringified}`;

		this.value = {
			stringified,
			original: value,
		};
	}
}

export function removeGroup(group: GroupComponent): void {
	if (group.element == null) {
		return;
	}

	group.element.innerHTML = '';

	group.element.remove();
}

export function renderGroup(state: State, component: GroupComponent): void {
	component.element ??= createElement(
		'div',
		{
			className: `${CSS_TABELA_ROW} ${CSS_TABELA_ROW_GROUP}`,
			innerHTML: `<div class="tabela__cell tabela__cell--group" role="cell">
	<button class="tabela__button tabela__button--group" data-event="group" data-key="tabela_${state.id}_${component.key}" type="button">
		<span aria-hidden="true"></span>
		<span>Open/close</span>
	</button>
	<p>${component.label}</p>
	<span class="tabela__group__total">${component.total}</span>
	<span class="tabela__group__selected">${component.selected === 0 ? '' : component.selected}</span>
</div>`,
			role: 'row',
		},
		{},
		{
			height: `${state.options.rowHeight}px`,
		},
	);
}

export function updateGroup(state: State, component: GroupComponent): void {
	if (component.element == null) {
		return;
	}

	const selected = component.element.querySelector<HTMLSpanElement>('.tabela__group__selected');
	const total = component.element.querySelector<HTMLSpanElement>('.tabela__group__total');

	if (selected != null) {
		selected.textContent = component.selected === 0 ? '' : String(component.selected);
	}

	if (total != null) {
		total.textContent = String(component.total);
	}
}
