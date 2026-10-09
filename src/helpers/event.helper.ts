import {findAncestor} from '@oscarpalmer/toretto/find';
import {ATTRIBUTE_DATA_EVENT, SELECTOR_EVENT_ATTRIBUTE} from '../models/dom.model';
import {
	EVENT_GROUP,
	EVENT_HEADER,
	EVENT_ROW,
	mappedEventManagers,
	type EventManager,
} from '../models/event.model';
import {SELECTOR_TABLE} from '../models/style.model';
import {onGroup} from './group.helper';
import {handleNavigation} from './navigation.helper';
import {onSelection} from './selection.helper';
import {onSort} from './sort.helper';

// #region Functions

export function onClick(event: MouseEvent): void {
	const target = findAncestor(event, SELECTOR_EVENT_ATTRIBUTE);
	const table = findAncestor(event, SELECTOR_TABLE);

	if (!(target instanceof HTMLElement) || !(table instanceof HTMLElement)) {
		return;
	}

	const manager = mappedEventManagers.get(table);

	if (manager != null) {
		onType(manager, event, target, target?.getAttribute(ATTRIBUTE_DATA_EVENT) ?? undefined);
	}
}

export function onKeydown(event: KeyboardEvent): void {
	const target = findAncestor(event, SELECTOR_EVENT_ATTRIBUTE);
	const table = findAncestor(event, SELECTOR_TABLE);

	if (!(target instanceof HTMLElement) || !(table instanceof HTMLElement)) {
		return;
	}

	const manager = mappedEventManagers.get(table);

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
