import type {Key} from '@oscarpalmer/atoms/models';
import {clamp} from '@oscarpalmer/atoms/number';
import {ATTRIBUTE_DATA_ACTIVE} from '../models/dom.model';
import {GROUP_KEY_PREFIX} from '../models/group.model';
import type {NavigationManager, NavigationManagerActiveType} from '../models/navigation.model';
import type {State} from '../models/tabela.model';
import {getGroup, isGroupKey} from './group.helper';
import {getRow} from './row.helper';

// #region Functions

export function focusNavigation(state: State): void {
	const {active} = state.managers.navigation;

	if (active.index >= state.managers.data.size) {
		const index = state.managers.data.size - 1;
		const key = state.managers.data.keys[index];

		active.index = index;
		active.row = key == null ? 'header' : key;
		active.type = key == null ? 'header' : isGroupKey(key) ? 'group' : 'row';
	}

	setNavigationStyles(state);
}

function getColumnIndex(state: State, event: KeyboardEvent, column: string): number {
	const current = state.managers.column.keys.indexOf(column);

	if (current === -1) {
		return 0;
	}

	return clamp(current + offset[event.key], 0, state.managers.column.keys.length - 1);
}

function getRowSelector(
	type: NavigationManagerActiveType,
	prefix: string,
	row: Key,
): string | undefined {
	switch (type) {
		case 'footer':
		case 'header':
			return `${prefix}_${type}`;

		case 'group':
			return `${prefix}_group_${String(row).replace(GROUP_KEY_PREFIX, '')}`;

		case 'row':
			return `${prefix}_row_${row}`;

		default:
			return undefined;
	}
}

export function initializeNavigation(state: State): void {
	setDefault(state, false);
}

export function handleNavigation(state: State, event: KeyboardEvent): void {
	if (!allKeys.has(event.key)) {
		return;
	}

	event.preventDefault();

	const {navigation} = state.managers;

	if (navigation.active.type == null) {
		setDefault(state);

		return;
	}

	if (absoluteKeys.has(event.key)) {
		setAbsolute(navigation, event.key === KEY_HOME);
	} else if (horiziontalKeys.has(event.key)) {
		navigation.active.column =
			state.managers.column.keys[getColumnIndex(state, event, navigation.active.column!)];
	} else {
		setOffset(state, event);
	}

	setNavigationStyles(state);
}

function setAbsolute(manager: NavigationManager, home: boolean): void {
	const {active, state} = manager;

	active.column = state.managers.column.keys.at(home ? 0 : -1);
}

function setDefault(state: State, focus?: boolean): void {
	const {active} = state.managers.navigation;

	active.column = state.managers.column.items[0]?.options.key;
	active.row = 'header';
	active.type = 'header';

	setNavigationStyles(state, focus);
}

function setOffset(state: State, event: KeyboardEvent): void {
	const {active} = state.managers.navigation;

	let index;

	if (active.type === 'footer') {
		index = state.managers.data.size;
	} else if (active.type === 'header') {
		index = -1;
	} else {
		index = state.managers.data.getIndex(active.row!);
	}

	let result: number | undefined;

	if (state.managers.data.size === 0) {
		result = active.type === 'footer' ? -1 : 1;
	} else {
		let next = index + (offset[event.key] ?? 0);

		while (true) {
			result = clamp(next, -1, state.managers.data.size);

			if (state.managers.group.collapsed.has(state.managers.data.keys[result])) {
				next += upKeys.has(event.key) ? -1 : 1;
			} else {
				break;
			}
		}
	}

	active.index = result;

	if (result < 0) {
		active.row = 'header';
		active.type = 'header';
	} else if (result >= state.managers.data.size) {
		if (state.components.footer.hidden) {
			return;
		}

		active.row = 'footer';
		active.type = 'footer';
	} else {
		const key = state.managers.data.keys[result];

		active.row = key;
		active.type = isGroupKey(key) ? 'group' : 'row';
	}
}

export function setNavigationStyles(state: State, focus?: boolean): void {
	const {active} = state.managers.navigation;

	const elements = state.elements.table.querySelectorAll(`[${ATTRIBUTE_DATA_ACTIVE}]`);

	for (const element of elements) {
		(element as HTMLElement).tabIndex = -1;

		element.removeAttribute(ATTRIBUTE_DATA_ACTIVE);
	}

	const selector = getRowSelector(active.type!, state.prefix, active.row!);

	state.elements.table.tabIndex = selector == null ? 0 : -1;

	if (selector == null) {
		state.elements.table.focus();

		return;
	}

	state.elements.table.querySelector(selector)?.setAttribute(ATTRIBUTE_DATA_ACTIVE, '');

	const element = state.elements.table.querySelector(
		`#${CSS.escape(`${selector}_column${active.type === 'group' ? '' : `_${active.column}`}`)}`,
	);

	state.elements.table.tabIndex = element == null ? 0 : -1;

	if (element == null) {
		state.elements.table.focus();

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
			top: state.managers.data.getIndex(active.row!) * state.options.rowHeight,
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

// #region Variables

const KEY_ARROW_DOWN = 'ArrowDown';

const KEY_ARROW_LEFT = 'ArrowLeft';

const KEY_ARROW_RIGHT = 'ArrowRight';

const KEY_ARROW_UP = 'ArrowUp';

const KEY_END = 'End';

const KEY_HOME = 'Home';

const KEY_PAGE_DOWN = 'PageDown';

const KEY_PAGE_UP = 'PageUp';

const absoluteKeys = new Set([KEY_END, KEY_HOME]);

const arrowKeys = new Set([KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT, KEY_ARROW_UP]);

const horiziontalKeys = new Set([KEY_ARROW_LEFT, KEY_ARROW_RIGHT]);

const offset: Record<string, number> = {
	[KEY_ARROW_DOWN]: 1,
	[KEY_ARROW_LEFT]: -1,
	[KEY_ARROW_RIGHT]: 1,
	[KEY_ARROW_UP]: -1,
	[KEY_PAGE_DOWN]: 10,
	[KEY_PAGE_UP]: -10,
};

const pageKeys = new Set([KEY_PAGE_DOWN, KEY_PAGE_UP]);

const upKeys = new Set([KEY_ARROW_UP, KEY_PAGE_UP]);

const allKeys = new Set([...absoluteKeys, ...arrowKeys, ...pageKeys]);

// #endregion
