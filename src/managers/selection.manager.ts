import {isKey} from '@oscarpalmer/atoms/is';
import type {EventPosition, Key} from '@oscarpalmer/atoms/models';
import {setAttribute} from '@oscarpalmer/toretto/attribute';
import {getPosition, on} from '@oscarpalmer/toretto/event';
import {findAncestor} from '@oscarpalmer/toretto/find';
import {createElement} from '../helpers/dom.helpers';
import {getKey, isGroupKey} from '../helpers/misc.helpers';
import {preventSelection} from '../helpers/style.helper';
import {ARIA_SELECTED, ATTRIBUTE_DATA_KEY, ELEMENT_DIV} from '../models/dom.model';
import {
	EVENT_SELECTION_ADD,
	EVENT_SELECTION_CLEAR,
	EVENT_SELECTION_REMOVE,
} from '../models/event.model';
import type {TabelaSelection} from '../models/selection.model';
import {CSS_CELL, CSS_ROW, CSS_ROW_SELECTED, CSS_SELECTION, CSS_TABLE} from '../models/style.model';
import type {State} from '../models/tabela.model';
import {getRow} from './row.manager';

// #region Types

export class SelectionManager {
	handlers: TabelaSelection = {
		add: keys => addSelection(this.state, keys),
		clear: () => clearSelection(this.state),
		remove: keys => removeSelection(this.state, keys),
		set: keys => setSelection(this.state, keys),
		toggle: () => toggleSelection(this.state),
	};

	last: Key | undefined;

	keys = new Set<Key>();

	constructor(public state: State) {
		mapped.set(state.element, this);
	}

	destroy(): void {
		mapped.delete(this.state.element);

		this.handlers = undefined as never;
		this.keys = undefined as never;
		this.last = undefined;
		this.state = undefined as never;
	}
}

// #endregion

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

function clearSelection(state: State): void {
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
		className: CSS_SELECTION,
	});

	return placeholder;
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

	const column = findAncestor(event, `.${CSS_CELL}`);

	if (event.shiftKey) {
		if (selection.last == null) {
			navigation.activate(key, (column as HTMLElement)?.dataset.key, false);
		} else {
			setRangeSelection(state, selection.last, key, (column as HTMLElement)?.dataset.key);
		}

		return;
	}

	selection.last = key;

	navigation.activate(key, (column as HTMLElement)?.dataset.key, false);

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

function onMouseDown(event: MouseEvent): void {
	if (shifted) {
		const row = findAncestor(event, rowSelector);

		if (!(row instanceof HTMLElement)) {
			return;
		}

		startElement = row;
		startPosition = getPosition(event)!;

		preventSelection.set();
	}
}

function onMouseMove(event: MouseEvent): void {
	if (startElement == null) {
		return;
	}

	const currentPosition = getPosition(event)!;

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

function onMouseUp(event: MouseEvent): void {
	if (startElement == null) {
		return;
	}

	if (!event.shiftKey) {
		shifted = false;

		preventSelection.remove();
	}

	getPlaceholder().remove();

	const row = findAncestor(event, rowSelector);

	if (row instanceof HTMLElement) {
		endElement = row;

		const column = findAncestor(event, `.${CSS_CELL}`);

		const endTable = findAncestor(endElement, tableSelector);
		const startTable = findAncestor(startElement, tableSelector);

		if (startTable != null && startTable === endTable) {
			const manager = mapped.get(startTable);

			if (manager != null) {
				setRangeSelection(
					manager.state,
					startElement,
					endElement,
					(column as HTMLElement)?.dataset.key,
				);
			}
		}
	}

	endElement = undefined;
	startElement = undefined;
	startPosition = undefined as never;
}

function onShift(event: KeyboardEvent, value: boolean): void {
	if (event.key === KEY_SHIFT) {
		shifted = value;
	}
}

function onShiftDown(event: KeyboardEvent): void {
	onShift(event, true);
}

function onShiftUp(event: KeyboardEvent): void {
	onShift(event, false);
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

function setSelection(state: State, keys: Key[]): void {
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

function toggleSelection(state: State): void {
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

const KEY_SHIFT = 'Shift';

const mapped = new WeakMap<Element, SelectionManager>();

const rowSelector = `.${CSS_ROW}`;

const tableSelector = `.${CSS_TABLE}`;

let shifted = false;

let endElement: HTMLElement | undefined;
let placeholder: HTMLElement;
let startPosition: EventPosition;
let startElement: HTMLElement | undefined;

// #endregion

// #region Initialization

on(document, 'keydown', onShiftDown);
on(document, 'keyup', onShiftUp);
on(document, 'mousedown', onMouseDown);
on(document, 'mousemove', onMouseMove);
on(document, 'mouseup', onMouseUp);

// #endregion
