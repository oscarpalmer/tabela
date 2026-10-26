import type {Key} from '@oscarpalmer/atoms/models';
import {clamp} from '@oscarpalmer/atoms/number';
import {getString} from '@oscarpalmer/atoms/string';
import {ATTRIBUTE_DATA_ACTIVE} from '../../models/dom.model';
import {GROUP_KEY_PREFIX} from '../../models/group.model';
import {
	navigationOffset,
	navigationUpKeys,
	type NavigationManager,
	type NavigationManagerActiveType,
} from '../../models/navigation.model';
import type {State} from '../../models/tabela.model';
import {getKeyIndex} from '../data/data.misc';
import {getGroup} from '../group/group.item';
import {isGroupKey} from '../group/group.misc';
import {getRow} from '../row.helper';

// #region Functions

export function getNavigationColumnIndex(
	state: State,
	event: KeyboardEvent,
	column?: string,
): number {
	if (column == null) {
		return -1;
	}

	const {keys} = state.managers.column;

	const current = keys.indexOf(column);

	if (current === -1) {
		return 0;
	}

	return clamp(current + navigationOffset[event.key], 0, keys.length - 1);
}

export function getNavigationRowSelector(
	type: NavigationManagerActiveType,
	prefix: string,
	row: Key,
): string | undefined {
	switch (type) {
		case 'footer':
		case 'header':
			return `${prefix}_${type}`;

		case 'group':
			return `${prefix}_group_${getString(row).replace(GROUP_KEY_PREFIX, '')}`;

		case 'row':
			return `${prefix}_row_${row}`;

		default:
			return undefined;
	}
}

export function initializeNavigation(state: State): void {
	setDefaultNavigation(state, false);
}

export function setAbsoluteNavigation(manager: NavigationManager, home: boolean): void {
	const {active, state} = manager;

	active.column = state.managers.column.keys.at(home ? 0 : -1);
}

export function setDefaultNavigation(state: State, focus?: boolean): void {
	const {active} = state.managers.navigation;

	active.column = state.managers.column.items[0]?.key.original;
	active.row = 'header';
	active.type = 'header';

	setNavigationStyles(state, focus);
}

export function setNavigationOffset(state: State, event: KeyboardEvent): void {
	const {data, group, navigation} = state.managers;
	const {keys, size} = data;
	const {active} = navigation;

	let index;

	if (active.type === 'footer') {
		index = size;
	} else if (active.type === 'header') {
		index = -1;
	} else {
		index = getKeyIndex(state, active.row);
	}

	let result: number | undefined;

	if (size === 0) {
		result = active.type === 'footer' ? -1 : 1;
	} else {
		let next = index + (navigationOffset[event.key] ?? 0);

		while (true) {
			result = clamp(next, -1, size);

			if (group.collapsed.has(keys[result])) {
				next += navigationUpKeys.has(event.key) ? -1 : 1;
			} else {
				break;
			}
		}
	}

	active.index = result;

	if (result < 0) {
		active.row = 'header';
		active.type = 'header';
	} else if (result >= size) {
		if (state.components.footer.hidden) {
			return;
		}

		active.row = 'footer';
		active.type = 'footer';
	} else {
		const key = keys[result];

		active.row = key;
		active.type = isGroupKey(key) ? 'group' : 'row';
	}
}

export function setNavigationStyles(state: State, focus?: boolean): void {
	const {table} = state.elements;
	const {active} = state.managers.navigation;

	const elements = table.querySelectorAll(`[${ATTRIBUTE_DATA_ACTIVE}]`);
	const {length} = elements;

	for (let index = 0; index < length; index += 1) {
		const element = elements[index];

		(element as HTMLElement).tabIndex = -1;

		element.removeAttribute(ATTRIBUTE_DATA_ACTIVE);
	}

	const rowSelector =
		active.row == null || active.type == null
			? undefined
			: getNavigationRowSelector(active.type, state.prefix, active.row);

	table.tabIndex = rowSelector == null ? 0 : -1;

	if (rowSelector == null) {
		table.focus();

		return;
	}

	table.querySelector(rowSelector)?.setAttribute(ATTRIBUTE_DATA_ACTIVE, '');

	const columnSuffix = active.type === 'group' ? '' : `_${active.column}`;
	const columnSelector = `${rowSelector}_column${columnSuffix}`;

	const element = table.querySelector(`#${CSS.escape(columnSelector)}`);

	table.tabIndex = element == null ? 0 : -1;

	if (element == null) {
		table.focus();

		return;
	}

	(element as HTMLElement).tabIndex = 0;

	element.setAttribute(ATTRIBUTE_DATA_ACTIVE, '');

	if (focus ?? true) {
		(element as HTMLElement).focus();
	}

	if (active.type === 'footer' || active.type === 'header') {
		return;
	}

	const component =
		active.type === 'group' ? getGroup(state, active.row) : getRow(state, active.row, false);

	if (component?.element == null) {
		state.components.body.elements.group.parentElement?.scrollTo({
			top: getKeyIndex(state, active.row) * state.options.rowHeight,
			behavior: 'smooth',
		});
	} else {
		component.element.setAttribute(ATTRIBUTE_DATA_ACTIVE, 'true');

		component.element.scrollIntoView({
			block: 'nearest',
		});
	}
}

export function updateNavigation(state: State, focus?: boolean): void {
	setNavigationStyles(state, focus);
}

// #endregion
