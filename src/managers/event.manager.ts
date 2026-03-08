import {on} from '@oscarpalmer/toretto/event';
import {findAncestor} from '@oscarpalmer/toretto/find';
import type {State} from '../models/tabela.model';

export class EventManager {
	constructor(public state: State) {
		mapped.set(state.element, this);
	}

	destroy(): void {
		mapped.delete(this.state.element);

		this.state = undefined as never;
	}

	onSort(event: MouseEvent, target: HTMLElement): void {
		const direction = target.getAttribute('data-sort-direction');
		const field = target.getAttribute('data-field');

		if (field != null) {
			this.state.managers.sort.toggle(event, field, direction);
		}
	}
}

function onClick(event: MouseEvent): void {
	const target = findAncestor(event, '[data-event]');
	const table = findAncestor(event, '.tabela');

	if (!(target instanceof HTMLElement) || !(table instanceof HTMLElement)) {
		return;
	}

	const manager = mapped.get(table);

	if (manager == null) {
		return;
	}

	const type = target?.getAttribute('data-event');

	switch (type) {
		case 'heading':
			manager.onSort(event, target);
			break;

		case 'row':
			manager.state.managers.selection.handle(event, target);
			break;

		default:
			break;
	}
}

function onKeydown(event: KeyboardEvent): void {
	const target = findAncestor(event, '[data-event]');
	const table = findAncestor(event, '.tabela');

	if (!(target instanceof HTMLElement) || !(table instanceof HTMLElement)) {
		return;
	}

	const manager = mapped.get(table);

	if (manager == null) {
		return;
	}

	const type = target?.getAttribute('data-event');

	switch (type) {
		case 'body':
			manager.state.managers.navigation.handle(event);
			break;

		default:
			break;
	}
}

const mapped = new WeakMap<HTMLElement, EventManager>();

on(document, 'click', onClick);
on(document, 'keydown', onKeydown, {passive: false});
