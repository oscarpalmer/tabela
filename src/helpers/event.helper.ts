import {findAncestor} from '@oscarpalmer/toretto/find';
import {ATTRIBUTE_DATA_EVENT, SELECTOR_EVENT} from '../models/dom.model';
import {
	EVENT_FILTER_INPUT,
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
import {onFilter} from './filter.helper';

// #region Functions

export function onClick(event: MouseEvent): void {
	onEvent(event, (event, manager, target) => {
		onType(manager, event, target, target?.getAttribute(ATTRIBUTE_DATA_EVENT) ?? undefined);
	});
}

function onEvent<Evt extends Event>(
	event: Evt,
	callback: (event: Evt, manager: EventManager, target: HTMLElement) => void,
): void {
	const target = findAncestor(event, SELECTOR_EVENT);
	const table = findAncestor(event, SELECTOR_TABLE);

	if (!(target instanceof HTMLElement) || !(table instanceof HTMLElement)) {
		return;
	}

	const manager = mappedEventManagers.get(table);

	if (manager != null) {
		callback(event, manager, target);
	}
}

function onF(_: EventManager, __: KeyboardEvent, target: HTMLElement): void {
	const button = target.querySelector('button');

	if (button?.hasAttribute('popovertarget')) {
		button.click();
	}
}

export function onInput(event: InputEvent): void {
	onEvent(event, (_, manager, target) => {
		const type = target?.getAttribute(ATTRIBUTE_DATA_EVENT) ?? undefined;

		if (type === EVENT_FILTER_INPUT) {
			onFilter(manager.state, target as HTMLInputElement);
		}
	});
}

export function onKeydown(event: KeyboardEvent): void {
	onEvent(event, (event, manager, target) => {
		switch (event.key) {
			case ' ':
				event.preventDefault();
				onType(manager, event, target, manager.state.managers.navigation.active.type);
				break;

			case 'f':
				event.preventDefault();
				onF(manager, event, target);
				return;

			default:
				break;
		}

		handleNavigation(manager.state, event);
	});
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
