import {getString} from '@oscarpalmer/atoms/string';
import {createElement} from '../helpers/dom.helpers';
import {GROUP_KEY_PREFIX, type GroupValue} from '../models/group.model';
import {
	CSS_BUTTON,
	CSS_BUTTON_GROUP,
	CSS_CELL,
	CSS_CELL_GROUP,
	CSS_GROUP_SELECTED,
	CSS_GROUP_TOTAL,
	CSS_ROW,
	CSS_ROW_GROUP,
} from '../models/style.model';
import type {State} from '../models/tabela.model';
import {
	ATTRIBUTE_DATA_EVENT,
	ATTRIBUTE_DATA_KEY,
	ATTRIBUTE_ROLE,
	ELEMENT_DIV,
	ROLE_CELL,
	ROLE_ROW,
} from '../models/dom.model';
import {EVENT_GROUP} from '../models/event.model';

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

		this.key = `${GROUP_KEY_PREFIX}${stringified}`;

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
		ELEMENT_DIV,
		{
			className: `${CSS_ROW} ${CSS_ROW_GROUP}`,
			innerHTML: `<div class="${CSS_CELL} ${CSS_CELL_GROUP}" role="${ROLE_CELL}">
	<button class="${CSS_BUTTON} ${CSS_BUTTON_GROUP}" ${ATTRIBUTE_DATA_EVENT}="${EVENT_GROUP}" ${ATTRIBUTE_DATA_KEY}="${state.prefix}_${component.key}" type="button">
		<span aria-hidden="true"></span>
		<span>Open/close</span>
	</button>
	<p>${component.label}</p>
	<span class="${CSS_GROUP_TOTAL}">${component.total}</span>
	<span class="${CSS_GROUP_SELECTED}">${component.selected === 0 ? '' : component.selected}</span>
</div>`,
			[ATTRIBUTE_ROLE]: ROLE_ROW,
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

	const selected = component.element.querySelector<HTMLSpanElement>(selectedSelector);
	const total = component.element.querySelector<HTMLSpanElement>(totalSelector);

	if (selected != null) {
		selected.textContent = component.selected === 0 ? '' : String(component.selected);
	}

	if (total != null) {
		total.textContent = String(component.total);
	}
}

const selectedSelector = `.${CSS_GROUP_SELECTED}`;

const totalSelector = `.${CSS_GROUP_TOTAL}`;
