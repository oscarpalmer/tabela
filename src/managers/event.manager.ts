import {herald, type Events, type Herald} from '@oscarpalmer/atoms/herald';
import {on} from '@oscarpalmer/toretto/event';
import {findAncestor} from '@oscarpalmer/toretto/find';
import {ATTRIBUTE_DATA_EVENT} from '../models/dom.model';
import {
	EVENT_GROUP,
	EVENT_HEADER,
	EVENT_NAMES,
	EVENT_ROW,
	type EventMap,
} from '../models/event.model';
import {CSS_TABLE} from '../models/style.model';
import type {State} from '../models/tabela.model';
import {onGroup} from './group.manager';
import {handleNavigation} from './navigation.manager';
import {onSelection} from './selection.manager';
import {onSort} from './sort.manager';

// #region Types

export class EventManager {
	readonly herald: Herald<EventMap>;

	get events(): Events<EventMap> {
		return this.herald.events;
	}

	constructor(public state: State) {
		this.herald = herald(EVENT_NAMES);

		mapped.set(state.element, this);
	}

	destroy(): void {
		mapped.delete(this.state.element);

		this.state = undefined as never;
	}
}

// #endregion

// #region Functions

function onClick(event: MouseEvent): void {
	const target = findAncestor(event, eventAttribute);
	const table = findAncestor(event, tableClassName);

	if (!(target instanceof HTMLElement) || !(table instanceof HTMLElement)) {
		return;
	}

	const manager = mapped.get(table);

	if (manager != null) {
		onType(manager, event, target, target?.getAttribute(ATTRIBUTE_DATA_EVENT) ?? undefined);
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

		onType(manager, event, target, manager.state.managers.navigation.active.type);

		return;
	}

	handleNavigation(manager.state, event);
}

function onType(
	manager: EventManager,
	event: KeyboardEvent | MouseEvent,
	target: HTMLElement,
	type?: string,
): void {
	switch (type) {
		case EVENT_GROUP:
			onGroup(manager.state, target);
			break;

		case EVENT_HEADER:
			onSort(event, manager.state, target);
			break;

		case EVENT_ROW:
			onSelection(manager.state, event, target);
			break;

		default:
			break;
	}
}

// #endregion

// #region Variables

const eventAttribute = `[${ATTRIBUTE_DATA_EVENT}]`;

const mapped = new WeakMap<HTMLElement, EventManager>();

const tableClassName = `.${CSS_TABLE}`;

// #endregion

// #region Initialization

on(document, 'click', onClick);
on(document, 'keydown', onKeydown, {passive: false});

// #endregion
