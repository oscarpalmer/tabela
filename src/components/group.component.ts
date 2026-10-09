import {getString} from '@oscarpalmer/atoms/string';
import {setAttributes} from '@oscarpalmer/toretto/attribute';
import {createElement} from '@oscarpalmer/toretto/create';
import {
	ARIA_ROWINDEX,
	ATTRIBUTE_DATA_EVENT,
	ATTRIBUTE_DATA_KEY,
	ELEMENT_DIV,
	ROLE_CELL,
	ROLE_ROW,
} from '../models/dom.model';
import {EVENT_GROUP, EVENT_GROUP_UPDATE} from '../models/event.model';
import {GROUP_KEY_PREFIX, type GroupComponent} from '../models/group.model';
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

// #region Instances

function GroupComponent(this: GroupComponent, label: string, value: unknown): void {
	this.expanded = true;
	this.filtered = 0;
	this.label = label;
	this.selected = 0;
	this.total = 0;

	const stringified = getString(value);

	this.key = {
		full: `${GROUP_KEY_PREFIX}${stringified}`,
		short: stringified,
	};

	this.value = {
		stringified,
		original: value,
	};
}

// #endregion

// #region Functions

export function createGroup(label: string, value: unknown): GroupComponent {
	// @ts-expect-error All good, no worries :-)
	return new GroupComponent(label, value);
}

export function removeGroup(group: GroupComponent): void {
	if (group.element == null) {
		return;
	}

	group.element.innerHTML = '';

	group.element.remove();
}

export function renderGroup(state: State, component: GroupComponent): void {
	component.element ??= createElement(ELEMENT_DIV, {
		attribute: {
			[ARIA_ROWINDEX]: String(state.managers.data.getIndex(component.key.full) + 1),
			[ATTRIBUTE_DATA_KEY]: component.key.full,
		},
		property: {
			className: `${CSS_ROW} ${CSS_ROW_GROUP}`,
			id: `${state.prefix}_group_${component.key.short}`,
			innerHTML: `<div class="${CSS_CELL} ${CSS_CELL_GROUP}" id="${state.prefix}_group_${component.key.short}_column" role="${ROLE_CELL}" tabindex="-1">
	<button class="${CSS_BUTTON} ${CSS_BUTTON_GROUP}" ${ATTRIBUTE_DATA_EVENT}="${EVENT_GROUP}" ${ATTRIBUTE_DATA_KEY}="${state.prefix}_${component.key.full}" tabindex="-1" type="button">
		<span aria-hidden="true"></span>
		<span>Open/close</span>
	</button>
	<p>${component.label}</p>
	<span class="${CSS_GROUP_TOTAL}">${component.total}</span>
	<span class="${CSS_GROUP_SELECTED}">${component.selected === 0 ? '' : component.selected}</span>
</div>`,
			role: ROLE_ROW,
		},
		style: {
			height: `${state.options.rowHeight}px`,
		},
	});
}

export function updateGroup(state: State, component: GroupComponent, emit: boolean): void {
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

	setAttributes(component.element, {
		[ARIA_ROWINDEX]: String(state.managers.data.getIndex(component.key.full) + 1),
	});

	if (emit) {
		state.managers.event.herald.emit(EVENT_GROUP_UPDATE, [component]);
	}
}

// #endregion

// #region Variables

const selectedSelector = `.${CSS_GROUP_SELECTED}`;

const totalSelector = `.${CSS_GROUP_TOTAL}`;

// #endregion
