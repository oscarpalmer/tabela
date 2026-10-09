import {herald} from '@oscarpalmer/atoms/herald';
import {on} from '@oscarpalmer/toretto/event';
import {onClick, onKeydown} from '../helpers/event.helper';
import {
	EVENT_NAMES,
	mappedEventManagers,
	type EventManager,
	type EventMap,
} from '../models/event.model';
import type {State} from '../models/tabela.model';

// #region Instances

function EventManager(this: EventManager, state: State): void {
	this.state = state;

	this.herald = herald<EventMap>({
		names: EVENT_NAMES,
	});

	mappedEventManagers.set(state.elements.wrapper, this);
}

EventManager.prototype.destroy = destroyEventManager;

// #endregion

// #region Functions

export function createEventManager(state: State): EventManager {
	// @ts-expect-error All good, no worries :-)
	return new EventManager(state);
}

function destroyEventManager(this: EventManager): void {
	mappedEventManagers.delete(this.state.elements.wrapper);

	this.herald.clear();

	this.state = undefined as never;
}

// #endregion

// #region Initialization

on(document, 'click', onClick);
on(document, 'keydown', onKeydown, {passive: false});

// #endregion
