import {createElement} from '../helpers/dom.helpers';
import {CSS_TABELA_ROW, CSS_TABELA_ROW_GROUP} from '../models/style.model';
import type {State} from '../models/tabela.model';

export class GroupComponent {
	element: HTMLElement | undefined;

	expanded = true;

	filtered = 0;

	selected = 0;

	total = 0;

	constructor(
		readonly key: string,
		readonly label: string,
		readonly value: unknown,
	) {}
}

export function renderGroup(state: State, component: GroupComponent): void {
	component.element ??= createElement(
		'div',
		{
			className: `${CSS_TABELA_ROW} ${CSS_TABELA_ROW_GROUP}`,
			innerHTML: `<div class="tabela__cell tabela__cell--group" role="cell">
	<button class="tabela__button tabela__button--group" data-event="group" data-key="${component.key}" type="button">
		<span aria-hidden="true"></span>
		<span>Open/close</span>
	</button>
	<p>${component.label}</p>
</div>`,
			role: 'row',
		},
		{},
		{
			height: `${state.options.rowHeight}px`,
		},
	);
}

export function updateGroup(state: State, component: GroupComponent): void {}
