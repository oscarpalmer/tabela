import {isKey} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
import {setAttribute} from '@oscarpalmer/toretto/attribute';
import {getPosition, on} from '@oscarpalmer/toretto/event';
import {findAncestor} from '@oscarpalmer/toretto/find';
import type {EventPosition} from '@oscarpalmer/toretto/models';
import {createElement} from '../helpers/dom.helpers';
import {getKey, isGroupKey} from '../helpers/misc.helpers';
import {preventSelection} from '../helpers/style.helper';
import {ARIA_SELECTED, ATTRIBUTE_DATA_KEY, ELEMENT_DIV} from '../models/dom.model';
import type {TabelaSelection} from '../models/selection.model';
import {CSS_ROW_BODY, CSS_ROW_SELECTED, CSS_SELECTION, CSS_TABLE} from '../models/style.model';
import type {State} from '../models/tabela.model';
import {
	EVENT_SELECTION_ADD,
	EVENT_SELECTION_CLEAR,
	EVENT_SELECTION_REMOVE,
} from '../models/event.model';

export class SelectionManager {
	handlers: TabelaSelection = {
		add: keys => this.add(keys),
		clear: () => this.clear(),
		remove: keys => this.remove(keys),
		set: keys => this.set(keys),
		toggle: () => this.toggle(),
	};

	items = new Set<Key>();

	last: Key | undefined;

	constructor(public state: State) {
		mapped.set(state.element, this);
	}

	add(keys: Key[]): void {
		if (!Array.isArray(keys) || keys.length === 0) {
			return;
		}

		const {length} = keys;

		const added: Key[] = [];

		let update = false;

		for (let index = 0; index < length; index += 1) {
			const key = keys[index];

			if (isKey(key) && !this.items.has(key)) {
				added.push(key);

				this.items.add(key);

				update = true;
			}
		}

		if (update) {
			this.update(added, []);
		}
	}

	clear(): void {
		if (this.items.size === 0) {
			return;
		}

		const removed = [...this.items];

		this.items.clear();

		this.update([], removed);

		this.state.managers.event.emit(EVENT_SELECTION_CLEAR);
	}

	destroy(): void {
		mapped.delete(this.state.element);

		this.handlers = undefined as never;
		this.items = undefined as never;
		this.last = undefined;
		this.state = undefined as never;
	}

	handle(event: MouseEvent, target: HTMLElement): void {
		const key = getKey(target.getAttribute(ATTRIBUTE_DATA_KEY));

		if (key == null) {
			return;
		}

		const {items} = this;

		if (event.shiftKey) {
			if (this.last == null) {
				this.state.managers.navigation.setActive(key, false);
			} else {
				this.range(this.last, key);
			}

			return;
		}

		this.last = key;

		this.state.managers.navigation.setActive(key, false);

		if (event.ctrlKey || event.metaKey) {
			if (items.has(key)) {
				this.remove([key]);
			} else {
				this.add([key]);
			}

			return;
		}

		this.set([key]);
	}

	range(from: Key | HTMLElement, to: Key | HTMLElement): void {
		const {state} = this;

		const keyed = isKey(from) && isKey(to);

		const fromKey = keyed
			? (from as Key)
			: getKey((from as HTMLElement).getAttribute(ATTRIBUTE_DATA_KEY))!;

		const toKey = keyed
			? (to as Key)
			: getKey((to as HTMLElement).getAttribute(ATTRIBUTE_DATA_KEY))!;

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
			this.add(selected);
		} else {
			this.set(selected);
		}

		this.last = toKey;

		this.state.managers.navigation.setActive(toKey, false);
	}

	remove(keys: Key[]): void {
		if (!Array.isArray(keys) || keys.length === 0) {
			return;
		}

		const {length} = keys;

		const removed: Key[] = [];

		for (let index = 0; index < length; index += 1) {
			const key = keys[index];

			if (this.items.delete(key)) {
				removed.push(key);
			}
		}

		if (removed.length > 0) {
			this.update([], removed);
		}
	}

	set(keys: Key[]): void {
		if (!Array.isArray(keys)) {
			return;
		}

		const {items} = this;

		const removed = [...items].filter(key => !keys.includes(key));
		const added = keys.filter(key => isKey(key) && !items.has(key));

		if (removed.length === 0 && added.length === 0) {
			return;
		}

		this.items = new Set(added);

		this.update(added, removed);
	}

	toggle(): void {
		const {items, state} = this;
		const {keys} = state.managers.data;

		if (items.size === keys.length - state.managers.group.items.length) {
			this.clear();
		} else {
			this.set(keys.filter(key => !isGroupKey(key)));
		}
	}

	update(added: Key[], removed: Key[]): void {
		const {state} = this;

		const items = [
			...removed.map(key => ({key, removed: true})),
			...[...this.items].map(key => ({key, removed: false})),
		];

		let {length} = items;

		for (let index = 0; index < length; index += 1) {
			const {key, removed} = items[index];

			const element = state.managers.row.get(key, false)?.element;

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
			this.state.managers.event.emit(EVENT_SELECTION_REMOVE, removed);
		}

		if (added.length > 0) {
			this.state.managers.event.emit(EVENT_SELECTION_ADD, added);
		}
	}
}

function getPlaceholder(): HTMLElement {
	placeholder ??= createElement(ELEMENT_DIV, {
		className: CSS_SELECTION,
	});

	return placeholder;
}

function onMouseDown(event: MouseEvent): void {
	if (shifted) {
		const row = findAncestor(event.target as HTMLElement, `.${CSS_ROW_BODY}`);

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

	const row = findAncestor(event.target as HTMLElement, bodyRowSelector);

	if (row instanceof HTMLElement) {
		endElement = row;

		const endTable = findAncestor(endElement, tableSelector);
		const startTable = findAncestor(startElement, tableSelector);

		if (startTable != null && startTable === endTable) {
			mapped.get(startTable)?.range(startElement, endElement);
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

const KEY_SHIFT = 'Shift';

const mapped = new WeakMap<Element, SelectionManager>();

const bodyRowSelector = `.${CSS_ROW_BODY}`;

const tableSelector = `.${CSS_TABLE}`;

let shifted = false;

let endElement: HTMLElement | undefined;
let placeholder: HTMLElement;
let startPosition: EventPosition;
let startElement: HTMLElement | undefined;

on(document, 'keydown', onShiftDown);
on(document, 'keyup', onShiftUp);
on(document, 'mousedown', onMouseDown);
on(document, 'mousemove', onMouseMove);
on(document, 'mouseup', onMouseUp);
