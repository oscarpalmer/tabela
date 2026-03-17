import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {on} from '@oscarpalmer/toretto/event';
import {findAncestor} from '@oscarpalmer/toretto/find';
import {isEvent} from '../helpers/misc.helpers';
import {
	ATTRIBUTE_DATA_EVENT,
	ATTRIBUTE_DATA_KEY,
	ATTRIBUTE_DATA_SORT_DIRECTION,
} from '../models/dom.model';
import {
	EVENT_GROUP,
	EVENT_HEADING,
	EVENT_ROW,
	type EventMap,
	type EventName,
	type Events,
	type TabelaEvents,
} from '../models/event.model';
import {CSS_TABLE} from '../models/style.model';
import type {State} from '../models/tabela.model';

export class EventManager {
	events: Events = {};

	handlers: TabelaEvents = {
		subscribe: (name, callback) => this.subscribe(name, callback),
		unsubscribe: (name, callback) => this.unsubscribe(name, callback),
	};

	constructor(public state: State) {
		mapped.set(state.element, this);
	}

	emit<Name extends EventName>(name: Name, ...parameters: Parameters<EventMap[Name]>): void {
		if (this.events[name] == null) {
			return;
		}

		const handlers = [...this.events[name]];
		const {length} = handlers;

		for (let index = 0; index < length; index += 1) {
			(handlers[index] as GenericCallback)(...parameters);
		}
	}

	destroy(): void {
		mapped.delete(this.state.element);

		this.state = undefined as never;
	}

	onSort(event: MouseEvent, target: HTMLElement): void {
		const direction = target.getAttribute(ATTRIBUTE_DATA_SORT_DIRECTION);
		const key = target.getAttribute(ATTRIBUTE_DATA_KEY);

		if (key != null) {
			this.state.managers.sort.toggle(event, key, direction);
		}
	}

	subscribe(name: string, callback: GenericCallback): void {
		if (!isEvent(name) || typeof callback !== 'function') {
			return;
		}

		(this.events as Record<string, Set<unknown>>)[name] ??= new Set();

		(this.events[name] as Set<unknown>).add(callback);
	}

	unsubscribe(name: string, callback: GenericCallback): void {
		if (isEvent(name) && typeof callback === 'function') {
			this.events[name]?.delete(callback);
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
