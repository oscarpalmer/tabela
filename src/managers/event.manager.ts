import {on} from '@oscarpalmer/toretto/event';
import type {RemovableEventListener} from '@oscarpalmer/toretto/models';
import type {TabelaManagers} from '../models/tabela.model';
import {findAncestor} from '@oscarpalmer/toretto';

export class EventManager {
	listener!: RemovableEventListener;

	constructor(
		readonly managers: TabelaManagers,
		element: HTMLElement,
	) {
		on(
			element,
			'click',
			event => {
				this.onClick(event);
			},
			{
				passive: false,
			},
		);
	}

	destroy(): void {
		this.listener();
	}

	onClick(event: MouseEvent): void {
		const target = findAncestor(event, '[data-event]');

		if (!(target instanceof HTMLElement)) {
			return;
		}

		const type = target?.getAttribute('data-event');

		switch (type) {
			case 'heading':
				this.onSort(event, target);
				break;
		}
	}

	onSort(event: MouseEvent, target: HTMLElement): void {
		const {managers} = this;

		const direction = target.getAttribute('data-sort-direction');
		const field = target.getAttribute('data-field');

		if (field != null) {
			managers.sort.toggle(event, field, direction);
		}
	}
}
