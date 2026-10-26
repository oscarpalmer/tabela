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
} from '../../models/dom.model';
import {EVENT_GROUP, EVENT_GROUP_UPDATE} from '../../models/event.model';
import type {GroupComponent} from '../../models/group.model';
import {
	CSS_BUTTON,
	CSS_BUTTON_GROUP,
	CSS_CELL,
	CSS_CELL_GROUP,
	CSS_GROUP_SELECTED,
	CSS_GROUP_TOTAL,
	CSS_ROW,
	CSS_ROW_GROUP,
	SELECTOR_GROUP_SELECTED,
	SELECTOR_GROUP_TOTAL,
} from '../../models/style.model';
import type {State} from '../../models/tabela.model';
import {getKeyIndex} from '../data/data.misc';
import {getTabelaGroup} from './group.misc';

// #region Functions

export function renderGroup(state: State, component: GroupComponent, index: number): void {
	if (component.cell != null || component.element != null) {
		return;
	}

	const {expanded, filtered, key, selected, total, value} = component;
	const {options, prefix} = state;

	const element = createElement(ELEMENT_DIV, {
		attribute: {
			[ARIA_ROWINDEX]: getString(index + 1),
			[ATTRIBUTE_DATA_KEY]: key.full,
		},
		property: {
			className: `${CSS_ROW} ${CSS_ROW_GROUP}`,
			id: `${prefix}_group_${key.short}`,
			role: ROLE_ROW,
		},
		style: {
			minHeight: `${options.grouping?.height ?? options.rowHeight}px`,
		},
	});

	const cell = createElement(ELEMENT_DIV, {
		data: {
			key: `${prefix}_${key.full}`,
		},
		property: {
			className: `${CSS_CELL} ${CSS_CELL_GROUP}`,
			id: `${prefix}_group_${key.short}_cell`,
			role: ROLE_CELL,
			tabIndex: -1,
		},
	});

	if (typeof options.grouping?.label === 'function') {
		const rendered = options.grouping.label({
			expanded,
			filtered,
			selected,
			total,
			value: value.original,
		});

		cell.append(...((Array.isArray(rendered) ? rendered : [rendered]) as string[]));
	} else {
		const button = createElement('button', {
			attribute: {
				[ATTRIBUTE_DATA_EVENT]: EVENT_GROUP,
			},
			property: {
				className: `${CSS_BUTTON} ${CSS_BUTTON_GROUP}`,
				tabIndex: -1,
				type: 'button',
			},
		});

		const label = createElement('p', {
			property: {
				textContent: component.label,
			},
		});

		const totalSpan = createElement('span', {
			property: {
				className: CSS_GROUP_TOTAL,
				textContent: total.toString(),
			},
		});

		const selectedSpan = createElement('span', {
			property: {
				className: CSS_GROUP_SELECTED,
				textContent: selected === 0 ? '' : selected.toString(),
			},
		});

		cell.append(button, label, totalSpan, selectedSpan);
	}

	element.append(cell);

	component.cell = cell;
	component.element = element;
}

export function updateGroup(state: State, component: GroupComponent, emit: boolean): void {
	const {cell, element} = component;

	if (cell == null || element == null) {
		return;
	}

	const {options, managers} = state;
	const {expanded, filtered, key, selected, total, value} = component;

	if (typeof options.grouping?.label === 'function') {
		cell.innerHTML = '';

		const rendered = options.grouping.label({
			expanded,
			filtered,
			selected,
			total,
			value: value.original,
		});

		cell.append(...((Array.isArray(rendered) ? rendered : [rendered]) as string[]));

		return;
	}

	const selectedSpan = element.querySelector<HTMLSpanElement>(SELECTOR_GROUP_SELECTED);
	const totalSpan = element.querySelector<HTMLSpanElement>(SELECTOR_GROUP_TOTAL);

	if (selectedSpan != null) {
		selectedSpan.textContent = selected === 0 ? '' : getString(selected);
	}

	if (totalSpan != null) {
		totalSpan.textContent = getString(total);
	}

	setAttributes(element, {
		[ARIA_ROWINDEX]: getString(getKeyIndex(state, key.full) + 1),
	});

	if (emit) {
		managers.event.herald.emit(EVENT_GROUP_UPDATE, [component]);
	}
}

export function updateGroups(state: State, groups: GroupComponent[]): void {
	const {length} = groups;

	if (length === 0) {
		return;
	}

	for (let index = 0; index < length; index += 1) {
		updateGroup(state, groups[index], false);
	}

	state.managers.event.herald.emit(EVENT_GROUP_UPDATE, groups.map(getTabelaGroup));
}

// #endregion
