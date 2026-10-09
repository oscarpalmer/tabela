import {sort} from '@oscarpalmer/atoms/array/sort';
import {toMap} from '@oscarpalmer/atoms/array/to-map';
import {toRecord} from '@oscarpalmer/atoms/array/to-record';
import type {Key, Simplify} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import {compare} from '@oscarpalmer/atoms/value/compare';
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
import {
	EVENT_GROUP,
	EVENT_GROUP_ADD,
	EVENT_GROUP_CLEAR,
	EVENT_GROUP_REMOVE,
	EVENT_GROUP_TOGGLE,
	EVENT_GROUP_UPDATE,
} from '../models/event.model';
import {GROUP_KEY_EXPRESSION, type Group, type GroupComponent} from '../models/group.model';
import {RENDER_ORIGIN_DATA} from '../models/render.model';
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
} from '../models/style.model';
import type {State} from '../models/tabela.model';
import {focusNavigation} from './navigation.helper';
import {render} from './render.helper';

// #region Functions

export function addGroups(state: State, groups: GroupComponent[]): void {
	if (groups.length === 0) {
		return;
	}

	setGroups(state, [...state.managers.group.items, ...groups]);

	state.managers.event.herald.emit(EVENT_GROUP_ADD, groups.map(getTabelaGroup));
}

export function clearGroups(state: State): void {
	if (state.managers.group.items.length === 0) {
		return;
	}

	removeGroups(state, state.managers.group.items.splice(0));

	state.managers.group.collapsed.clear();

	state.managers.event.herald.emit(EVENT_GROUP_CLEAR);
}

export function getGroup(state: State, value: unknown, forValue: true): GroupComponent | undefined;

export function getGroup(state: State, key: unknown): GroupComponent | undefined;

export function getGroup(
	state: State,
	keyOrValue: unknown,
	forValue?: unknown,
): GroupComponent | undefined {
	return forValue === true
		? getGroupForValue(state, keyOrValue)
		: getGroupForKey(state, keyOrValue);
}

function getGroupForKey(state: State, key: unknown): GroupComponent | undefined {
	return typeof key === 'string' ? state.managers.group.mapped.get(key) : undefined;
}

function getGroupForValue(state: State, value: unknown): GroupComponent | undefined {
	const asString = getString(value);

	return state.managers.group.items.find(item => item.value.stringified === asString);
}

export function getTabelaGroup(group: GroupComponent): Group {
	return {
		value: group.value.original,
	};
}

export function isGroupKey(key: unknown): boolean {
	return typeof key === 'string' && GROUP_KEY_EXPRESSION.test(key);
}

export function onGroup(state: State, button: HTMLElement): void {
	const key = button.dataset.key?.replace(`${state.prefix}_`, '');
	const group = getGroupForKey(state, key ?? '');

	if (group != null) {
		toggleGroup(state, group);
	}
}

export function removeGroup(group: GroupComponent): void {
	if (group.element == null) {
		return;
	}

	group.element.innerHTML = '';

	group.element.remove();
}

export function removeGroups(state: State, groups: GroupComponent[]): void {
	const {length} = groups;

	if (length === 0) {
		return;
	}

	for (let index = 0; index < length; index += 1) {
		removeGroup(groups[index]);
	}

	setGroups(
		state,
		state.managers.group.items.filter(item => !groups.includes(item)),
	);

	state.managers.event.herald.emit(EVENT_GROUP_REMOVE, groups.map(getTabelaGroup));
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

export function setGroups(state: State, groups: GroupComponent[]): void {
	state.managers.group.items = sort(groups, (first, second) => compare(first.label, second.label));

	state.managers.group.mapped = toMap(groups, group => group.key.full);

	state.managers.group.order = toRecord(
		groups as Simplify<GroupComponent>[],
		group => group.value.stringified,
		(_, index) => index,
	);
}

export function toggleGroup(state: State, group: GroupComponent): void {
	const {collapsed, items} = state.managers.group;

	group.expanded = !group.expanded;

	const index = items.indexOf(group);

	let first = state.managers.data.data.keys.original.indexOf(group.key.full) + 1;

	const last =
		items[index + 1] == null
			? state.managers.data.data.keys.original.length - 1
			: state.managers.data.data.keys.original.indexOf(items[index + 1].key.full) - 1;

	for (; first <= last; first += 1) {
		const key = state.managers.data.data.keys.original[first] as Key;

		if (group.expanded) {
			collapsed.delete(key);
		} else {
			collapsed.add(key);
		}
	}

	state.managers.event.herald.emit(EVENT_GROUP_TOGGLE, {
		collapsed: group.expanded ? [] : [getTabelaGroup(group)],
		expanded: group.expanded ? [getTabelaGroup(group)] : [],
	});

	render(state, RENDER_ORIGIN_DATA);

	focusNavigation(state);
}

export function updateGroup(state: State, component: GroupComponent, emit: boolean): void {
	if (component.element == null) {
		return;
	}

	const selected = component.element.querySelector<HTMLSpanElement>(SELECTOR_GROUP_SELECTED);
	const total = component.element.querySelector<HTMLSpanElement>(SELECTOR_GROUP_TOTAL);

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
