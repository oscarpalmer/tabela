import {isKey} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
import {setAttribute} from '@oscarpalmer/toretto/attribute';
import {createElement} from '@oscarpalmer/toretto/create';
import {getEventPosition} from '@oscarpalmer/toretto/event';
import {findAncestor} from '@oscarpalmer/toretto/find';
import type {EventPosition} from '@oscarpalmer/toretto/models';
import {ARIA_SELECTED, ATTRIBUTE_DATA_KEY, ELEMENT_DIV} from '../models/dom.model';
import {
	EVENT_SELECTION_ADD,
	EVENT_SELECTION_CLEAR,
	EVENT_SELECTION_REMOVE,
} from '../models/event.model';
import {mappedSelectionManagers} from '../models/selection.model';
import {
	CSS_ROW_SELECTED,
	CSS_SELECTION,
	SELECTOR_CELL,
	SELECTOR_ROW,
	SELECTOR_TABLE,
} from '../models/style.model';
import type {State} from '../models/tabela.model';
import {isGroupKey} from './group.helper';
import {getKey} from './misc.helpers';
import {getRow} from './row.helper';
import {preventSelection} from './style.helper';

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

function getPlaceholder(): HTMLElement {
	placeholder ??= createElement(ELEMENT_DIV, {
		property: {
			className: CSS_SELECTION,
		},
	});

	return placeholder;
}

export function onSelectionMouseDown(event: MouseEvent): void {
	if (shifted) {
		const row = findAncestor(event, SELECTOR_ROW);

		if (!(row instanceof HTMLElement)) {
			return;
		}

		startElement = row;
		startPosition = getEventPosition(event)!;

		preventSelection.set();
	}
}

export function onSelectionMouseMove(event: MouseEvent): void {
	if (startElement == null) {
		return;
	}

	const currentPosition = getEventPosition(event)!;

	if (currentPosition == null || startPosition == null) {
		return;
	}

	const element = getPlaceholder();

	if (element.parentElement == null) {
		document.body.append(element);
	}

	const {x: cX, y: cY} = currentPosition;
	const {x: sX, y: sY} = startPosition;

	const top = Math.min(cY, sY);
	const left = Math.min(cX, sX);

	const width = Math.abs(cX - sX);
	const height = Math.abs(cY - sY);

	element.style.inset = `${top}px ${window.innerWidth - left - width}px ${window.innerHeight - top - height}px ${left}px`;
}

export function onSelectionMouseUp(event: MouseEvent): void {
	if (startElement == null) {
		return;
	}

	if (!event.shiftKey) {
		shifted = false;

		preventSelection.remove();
	}

	getPlaceholder().remove();

	const row = findAncestor(event, SELECTOR_ROW);

	if (row instanceof HTMLElement) {
		endElement = row;

		const cell = findAncestor(event, SELECTOR_CELL);
		const endTable = findAncestor(endElement, SELECTOR_TABLE);
		const startTable = findAncestor(startElement, SELECTOR_TABLE);

		if (startTable != null && startTable === endTable) {
			const manager = mappedSelectionManagers.get(startTable);

			if (manager != null) {
				setRangeSelection(
					manager.state,
					startElement,
					endElement,
					(cell as HTMLElement)?.dataset.key,
				);
			}
		}
	}

	endElement = undefined;
	startElement = undefined;
	startPosition = undefined as never;
}

export function onSelection(
	state: State,
	event: KeyboardEvent | MouseEvent,
	target: HTMLElement,
): void {
	const key = getKey(target.getAttribute(ATTRIBUTE_DATA_KEY));

	if (key == null) {
		return;
	}

	const {navigation, selection} = state.managers;
	const {keys: items} = selection;

	const cell = findAncestor(event, SELECTOR_CELL);

	if (event.shiftKey) {
		if (selection.last == null) {
			navigation.activate(key, (cell as HTMLElement)?.dataset.key, false);
		} else {
			setRangeSelection(state, selection.last, key, (cell as HTMLElement)?.dataset.key);
		}

		return;
	}

	selection.last = key;

	navigation.activate(key, (cell as HTMLElement)?.dataset.key, false);

	if (event.ctrlKey || event.metaKey) {
		if (items.has(key)) {
			removeSelection(state, [key]);
		} else {
			addSelection(state, [key]);
		}

		return;
	}

	setSelection(state, [key]);
}

export function onSelectionShiftDown(event: KeyboardEvent): void {
	onShift(event, true);
}

export function onSelectionShiftUp(event: KeyboardEvent): void {
	onShift(event, false);
}

function onShift(event: KeyboardEvent, value: boolean): void {
	if (event.key === 'Shift') {
		shifted = value;
	}
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

function setRangeSelection(
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

	const fromIndex = state.managers.data.getIndex(fromKey);
	const toIndex = state.managers.data.getIndex(toKey);

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

	const removed = [...items].filter(key => !keys.includes(key));

	const added = keys.filter(key => canBeAdded(state, key));

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
			keys.filter(key => !isGroupKey(key)),
		);
	}
}

function updateSelection(state: State, added: Key[], removed: Key[]): void {
	const {selection} = state.managers;

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

		setAttribute(element, ARIA_SELECTED, String(!removed));

		if (removed) {
			element.classList.remove(CSS_ROW_SELECTED);
		} else {
			element.classList.add(CSS_ROW_SELECTED);
		}
	}

	if (removed.length > 0) {
		state.managers.event.herald.emit(EVENT_SELECTION_REMOVE, removed);
	}

	if (added.length > 0) {
		state.managers.event.herald.emit(EVENT_SELECTION_ADD, added);
	}
}

// #endregion

// #region Variables

let shifted = false;

let endElement: HTMLElement | undefined;
let placeholder: HTMLElement;
let startPosition: EventPosition;
let startElement: HTMLElement | undefined;

// #endregion
