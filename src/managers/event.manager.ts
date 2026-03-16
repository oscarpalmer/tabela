import {on} from '@oscarpalmer/toretto/event';
import {findAncestor} from '@oscarpalmer/toretto/find';
import type {State} from '../models/tabela.model';
import {
	ATTRIBUTE_DATA_EVENT,
	ATTRIBUTE_DATA_FIELD,
	ATTRIBUTE_DATA_SORT_DIRECTION,
} from '../models/dom.model';
import {CSS_TABLE} from '../models/style.model';
import {EVENT_GROUP, EVENT_HEADING, EVENT_ROW} from '../models/event.model';

export class EventManager {
	constructor(public state: State) {
		mapped.set(state.element, this);
	}

	destroy(): void {
		mapped.delete(this.state.element);

		this.state = undefined as never;
	}

	onSort(event: MouseEvent, target: HTMLElement): void {
		const direction = target.getAttribute(ATTRIBUTE_DATA_SORT_DIRECTION);
		const field = target.getAttribute(ATTRIBUTE_DATA_FIELD);

		if (field != null) {
			this.state.managers.sort.toggle(event, field, direction);
		}
	}
}

function onClick(event: MouseEvent): void {
	const target = findAncestor(event, eventAttribute);
	const table = findAncestor(event, tableClassName);

	if (!(target instanceof HTMLElement) || !(table instanceof HTMLElement)) {
		return;
	}

	const manager = mapped.get(table);

	if (manager == null) {
		return;
	}

	const type = target?.getAttribute(ATTRIBUTE_DATA_EVENT);

	switch (type) {
		case EVENT_GROUP:
			manager.state.managers.group.handle(target);
			break;

		case EVENT_HEADING:
			manager.onSort(event, target);
			break;

		case EVENT_ROW:
			manager.state.managers.selection.handle(event, target);
			break;

		default:
			break;
	}
}

function onKeydown(event: KeyboardEvent): void {
	const target = findAncestor(event, eventAttribute);
	const table = findAncestor(event, tableClassName);

	if (!(target instanceof HTMLElement) || !(table instanceof HTMLElement)) {
		return;
	}

	const manager = mapped.get(table);

	if (manager == null) {
		return;
	}

	if (event.key === ' ') {
		event.preventDefault();

		// TODO: it's on the way

		return;
	}

	manager.state.managers.navigation.handle(event);
}

const eventAttribute = `[${ATTRIBUTE_DATA_EVENT}]`;

const mapped = new WeakMap<HTMLElement, EventManager>();

const tableClassName = `.${CSS_TABLE}`;

on(document, 'click', onClick);
on(document, 'keydown', onKeydown, {passive: false});
