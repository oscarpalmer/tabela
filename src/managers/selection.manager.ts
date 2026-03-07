import {isKey} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
import {findAncestor, type EventPosition} from '@oscarpalmer/toretto';
import {setAttribute} from '@oscarpalmer/toretto/attribute';
import {getPosition, on} from '@oscarpalmer/toretto/event';
import {createElement} from '../helpers/dom.helpers';
import {getKey} from '../helpers/misc.helpers';
import {dragStyling} from '../helpers/style.helper';
import type {TabelaManagers, TabelaSelection} from '../models/tabela.model';

export class SelectionManager {
	handlers = Object.freeze({
		clear: () => this.clear(),
		deselect: keys => this.deselect(keys),
		select: keys => this.select(keys),
		toggle: () => this.toggle(),
	} as TabelaSelection);

	items = new Set<Key>();

	last: Key | undefined;

	constructor(
		public element: HTMLElement,
		readonly managers: TabelaManagers,
	) {
		mapped.set(element, this);
	}

	clear(): void {
		if (this.items.size === 0) {
			return;
		}

		const removed = [...this.items];

		this.items.clear();

		this.update(removed);
	}

	deselect(keys: Key[]): void {
		const {length} = keys;

		const removed: Key[] = [];

		for (let index = 0; index < length; index += 1) {
			const key = keys[index];

			if (this.items.delete(key)) {
				removed.push(key);
			}
		}

		if (removed.length > 0) {
			this.update(removed);
		}
	}

	destroy(): void {
		mapped.delete(this.element);

		this.handlers = undefined as never;
		this.element = undefined as never;
		this.items = undefined as never;
	}

	handle(event: MouseEvent, target: HTMLElement): void {
		const key = getKey(target.getAttribute('data-key'));

		if (key == null) {
			return;
		}

		const {items} = this;

		if (event.shiftKey) {
			if (this.last == null) {
				this.last = key;

				return;
			}

			this.range(this.last, key);

			this.last = key;

			return;
		}

		this.last = key;

		if (event.ctrlKey || event.metaKey) {
			if (items.has(key)) {
				this.deselect([key]);
			} else {
				this.select([key]);
			}

			return;
		}

		if (items.has(key)) {
			if (items.size === 1) {
				this.clear();
			} else {
				this.set([key]);
			}
		} else {
			this.set([key]);
		}
	}

	range(from: Key | HTMLElement, to: Key | HTMLElement): void {
		const keyed = isKey(from) && isKey(to);

		const fromKey = keyed ? (from as Key) : getKey((from as HTMLElement).getAttribute('data-key'))!;
		const toKey = keyed ? (to as Key) : getKey((to as HTMLElement).getAttribute('data-key'))!;

		if (fromKey === toKey) {
			return;
		}

		const keys = this.managers.data.values.keys.active ?? this.managers.data.values.keys.original;

		const fromIndex = keys.indexOf(fromKey);
		const toIndex = keys.indexOf(toKey);

		if (fromIndex === -1 || toIndex === -1) {
			return;
		}

		const [start, end] = fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];

		const selected: Key[] = [];

		for (let index = start; index <= end; index += 1) {
			selected.push(keys[index]);
		}

		if (keyed) {
			this.select(selected);
		} else {
			this.set(selected);
		}
	}

	select(keys: Key[]): void {
		const {length} = keys;

		let update = false;

		for (let index = 0; index < length; index += 1) {
			const key = keys[index];

			if (!this.items.has(key)) {
				this.items.add(key);

				update = true;
			}
		}

		if (update) {
			this.update([]);
		}
	}

	set(keys: Key[]): void {
		const {items} = this;

		const removed = [...items].filter(key => !keys.includes(key));
		const added = keys.filter(key => !items.has(key));

		if (removed.length === 0 && added.length === 0) {
			return;
		}

		this.items = new Set(keys);

		this.update(removed);
	}

	toggle(): void {
		const {items, managers} = this;

		const all = managers.data.values.keys.active ?? managers.data.values.keys.original;

		if (items.size === all.length) {
			this.clear();
		} else {
			this.select(all);
		}
	}

	update(removed: Key[]): void {
		const items = [
			...removed.map(key => ({key, removed: true})),
			...[...this.items].map(key => ({key, removed: false})),
		];

		const {length} = items;

		for (let index = 0; index < length; index += 1) {
			const {key, removed} = items[index];

			const row = this.managers.row.get(key);

			if (row == null || row.element == null) {
				continue;
			}

			setAttribute(row.element, 'aria-selected', String(!removed));

			if (removed) {
				row.element.classList.remove('tabela__row--selected');
			} else {
				row.element.classList.add('tabela__row--selected');
			}
		}
	}
}

function getPlaceholder(): HTMLElement {
	placeholder ??= createElement(
		'div',
		{
			className: 'tabela__selection--placeholder',
		},
		{},
		{},
	);

	return placeholder;
}

function onMouseDown(event: MouseEvent): void {
	if (shifted) {
		const row = findAncestor(event.target as HTMLElement, '.tabela__row--body');

		if (!(row instanceof HTMLElement)) {
			return;
		}

		startElement = row;
		startPosition = getPosition(event)!;

		dragStyling.set();
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

		dragStyling.remove();
	}

	getPlaceholder().remove();

	const row = findAncestor(event.target as HTMLElement, '.tabela__row--body');

	if (row instanceof HTMLElement) {
		endElement = row;

		const endTable = findAncestor(endElement, '.tabela');
		const startTable = findAncestor(startElement, '.tabela');

		if (startTable != null && startTable === endTable) {
			mapped.get(startTable)?.range(startElement, endElement);
		}
	}

	endElement = undefined;
	startElement = undefined;
	startPosition = undefined as never;
}

function onShift(event: KeyboardEvent, value: boolean): void {
	if (event.key === 'Shift') {
		shifted = value;
	}
}

function onShiftDown(event: KeyboardEvent): void {
	onShift(event, true);
}

function onShiftUp(event: KeyboardEvent): void {
	onShift(event, false);
}

const mapped = new WeakMap<Element, SelectionManager>();

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
