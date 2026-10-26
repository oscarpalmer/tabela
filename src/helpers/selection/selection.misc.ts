import {filter} from '@oscarpalmer/atoms/array/filter';
import {isKey} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import {setAttribute} from '@oscarpalmer/toretto/attribute';
import {ARIA_SELECTED, ATTRIBUTE_DATA_KEY} from '../../models/dom.model';
import {
	EVENT_SELECTION_ADD,
	EVENT_SELECTION_CLEAR,
	EVENT_SELECTION_REMOVE,
} from '../../models/event.model';
import {CSS_ROW_SELECTED} from '../../models/style.model';
import type {State} from '../../models/tabela.model';
import {getKeyIndex} from '../data/data.misc';
import {updateGroups} from '../group/group.dom';
import {getGroup} from '../group/group.item';
import {isGroupKey} from '../group/group.misc';
import {getKey} from '../misc.helpers';
import {getRow} from '../row.helper';

// #region Functions

// #region Functions

export function addSelection(state: State, keys: Key[]): void {
	if (!Array.isArray(keys) || keys.length === 0) {
		return;
	}

	const {selection} = state.managers;
	const {length} = keys;

	const added: Key[] = [];

	let update = false;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (canBeAdded(state, key)) {
			added.push(key);

			selection.keys.add(key);

			update = true;
		}
	}

	if (update) {
		updateSelection(state, added, []);
	}
}

function canBeAdded(state: State, key: Key): boolean {
	return (
		isKey(key) &&
		!state.managers.selection.keys.has(key) &&
		!state.managers.group.collapsed.has(key)
	);
}

export function clearSelection(state: State): void {
	const {event, selection} = state.managers;

	if (selection.keys.size === 0) {
		return;
	}

	const removed = [...selection.keys];

	selection.keys.clear();

	updateSelection(state, [], removed);

	event.herald.emit(EVENT_SELECTION_CLEAR);
}

export function removeSelection(state: State, keys: Key[]): void {
	if (!Array.isArray(keys) || keys.length === 0) {
		return;
	}

	const {selection} = state.managers;
	const {length} = keys;

	const removed: Key[] = [];

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (selection.keys.delete(key)) {
			removed.push(key);
		}
	}

	if (removed.length > 0) {
		updateSelection(state, [], removed);
	}
}

export function setRangeSelection(
	state: State,
	from: Key | HTMLElement,
	to: Key | HTMLElement,
	column?: string,
): void {
	const {navigation, selection} = state.managers;

	const keyed = isKey(from) && isKey(to);

	const fromKey = keyed
		? (from as Key)
		: getKey((from as HTMLElement).getAttribute(ATTRIBUTE_DATA_KEY))!;

	const toKey = keyed ? (to as Key) : getKey((to as HTMLElement).getAttribute(ATTRIBUTE_DATA_KEY))!;

	if (fromKey === toKey) {
		return;
	}

	const {keys} = state.managers.data;

	const fromIndex = getKeyIndex(state, fromKey);
	const toIndex = getKeyIndex(state, toKey);

	if (fromIndex === -1 || toIndex === -1) {
		return;
	}

	const [start, end] = fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];

	const selected: Key[] = [];

	for (let index = start; index <= end; index += 1) {
		const key = keys[index];

		if (!isGroupKey(key)) {
			selected.push(key);
		}
	}

	if (keyed) {
		addSelection(state, selected);
	} else {
		setSelection(state, selected);
	}

	selection.last = toKey;

	navigation.activate(toKey, column, false);
}

export function setSelection(state: State, keys: Key[]): void {
	if (!Array.isArray(keys)) {
		return;
	}

	const {selection} = state.managers;
	const {keys: items} = selection;

	const removed = filter([...items], key => !keys.includes(key));
	const added = filter(keys, key => canBeAdded(state, key));

	if (removed.length === 0 && added.length === 0) {
		return;
	}

	selection.keys = new Set(added);

	updateSelection(state, added, removed);
}

export function toggleSelection(state: State): void {
	const {selection} = state.managers;
	const {keys: items} = selection;
	const {keys} = state.managers.data;

	if (items.size === keys.length - state.managers.group.items.length) {
		clearSelection(state);
	} else {
		setSelection(
			state,
			filter(keys, key => !isGroupKey(key)),
		);
	}
}

function updateSelection(state: State, added: Key[], removed: Key[]): void {
	const {event, group, selection} = state.managers;

	const items = [
		...removed.map(key => ({key, removed: true})),
		...[...selection.keys].map(key => ({key, removed: false})),
	];

	let {length} = items;

	for (let index = 0; index < length; index += 1) {
		const {key, removed} = items[index];

		const element = getRow(state, key, false)?.element;

		if (element == null) {
			continue;
		}

		setAttribute(element, ARIA_SELECTED, getString(!removed));

		if (removed) {
			element.classList.remove(CSS_ROW_SELECTED);
		} else {
			element.classList.add(CSS_ROW_SELECTED);
		}
	}

	length = group.items.length;

	for (let index = 0; index < length; index += 1) {
		group.items[index].selected = 0;
	}

	for (const key of selection.keys) {
		const found = getGroup(state, key, 'row');

		if (found != null) {
			found.selected += 1;
		}
	}

	updateGroups(state, group.items);

	if (removed.length > 0) {
		event.herald.emit(EVENT_SELECTION_REMOVE, removed);
	}

	if (added.length > 0) {
		event.herald.emit(EVENT_SELECTION_ADD, added);
	}
}

// #endregion

// #endregion
