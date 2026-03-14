import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import {clamp} from '@oscarpalmer/atoms/number';
import {getKey} from '../helpers/misc.helpers';
import type {DataItem} from '../models/data.model';
import type {State} from '../models/tabela.model';
import {GroupComponent} from '../components/group.component';

export class NavigationManager {
	active: DataItem | undefined;

	constructor(public state: State) {}

	destroy(): void {
		this.state = undefined as never;
	}

	handle(event: KeyboardEvent): void {
		if (!allKeys.has(event.key)) {
			return;
		}

		event.preventDefault();

		const {components, id, managers} = this.state;

		const activeDescendant = components.body.elements.group.getAttribute('aria-activedescendant');

		const {items} = managers.data;
		const {length} = items;

		let next: number;

		if (isNullableOrWhitespace(activeDescendant)) {
			next = getDefaultIndex(event.key, length);
		} else {
			next = getIndex(this.state, event, activeDescendant, id)!;
		}

		if (next != null) {
			this.setActive(items.at(next));
		}
	}

	setActive(item: DataItem | undefined, scroll?: boolean): void {
		const {components, id, managers, options} = this.state;

		this.active = item;

		const active = components.body.elements.group.querySelectorAll('[data-active="true"]');

		for (const item of active) {
			item.setAttribute('data-active', 'false');
		}

		const component = item instanceof GroupComponent ? item : managers.row.get(item!, false);

		if (component != null) {
			component.element?.setAttribute('data-active', 'true');

			if (scroll ?? true) {
				if (component.element == null) {
					components.body.elements.group.scrollTo({
						top: managers.data.getIndex(item!) * options.rowHeight,
						behavior: 'smooth',
					});
				} else {
					component.element.scrollIntoView({
						block: 'nearest',
					});
				}
			}
		}

		components.body.elements.group.setAttribute(
			'aria-activedescendant',
			component == null ? '' : `tabela_${id}_${component.key}`,
		);
	}
}

function getDefaultIndex(key: string, max: number): number {
	switch (true) {
		case negativeDefaultKeys.has(key):
			return -1;

		case key === 'PageDown':
			return Math.min(9, max - 1);

		case key === 'PageUp':
			return max < 10 ? 0 : max - 10;

		default:
			return 0;
	}
}

function getIndex(
	state: State,
	event: KeyboardEvent,
	active: string,
	id: number,
): number | undefined {
	const key = getKey(active.replace(`tabela_${id}_`, ''));

	if (key == null) {
		return;
	}

	if (absoluteKeys.has(event.key)) {
		return event.key === 'Home' ? 0 : state.managers.data.size - 1;
	}

	const index = state.managers.data.getIndex(key);

	const offset = getOffset(event.key);

	return clamp(index + offset, 0, state.managers.data.size - 1, true);
}

function getOffset(key: string): number {
	switch (key) {
		case 'ArrowDown':
			return 1;

		case 'ArrowUp':
			return -1;

		case 'PageDown':
			return 10;

		case 'PageUp':
			return -10;

		default:
			return 0;
	}
}

const absoluteKeys = new Set(['End', 'Home']);

const arrowKeys = new Set(['ArrowDown', 'ArrowUp']);

const negativeDefaultKeys = new Set(['ArrowUp', 'End']);

const pageKeys = new Set(['PageDown', 'PageUp']);

const allKeys = new Set([...absoluteKeys, ...arrowKeys, ...pageKeys]);
