import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
import {clamp} from '@oscarpalmer/atoms/number';
import {getKey} from '../helpers/misc.helpers';
import type {TabelaState} from '../models/tabela.model';

export class NavigationManager {
	active: Key | undefined;

	constructor(public state: TabelaState) {}

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

		const keys = managers.data.values.keys.active ?? managers.data.values.keys.original;
		const {length} = keys;

		let next: number;

		if (isNullableOrWhitespace(activeDescendant)) {
			next = getDefaultIndex(event.key, length);
		} else {
			next = getIndex(event, activeDescendant, id, keys)!;
		}

		if (next != null) {
			this.setActive(keys.at(next)!);
		}
	}

	setActive(key: Key | undefined, scroll?: boolean): void {
		const {components, managers, options} = this.state;

		this.active = key;

		const active = components.body.elements.group.querySelectorAll('[data-active="true"]');

		for (const item of active) {
			item.setAttribute('data-active', 'false');
		}

		const row = managers.row.get(key!);

		if (row != null) {
			row.element?.setAttribute('data-active', 'true');

			if (scroll ?? true) {
				if (row.element == null) {
					components.body.elements.group.scrollTo({
						top: managers.data.getIndex(key!) * options.rowHeight,
						behavior: 'smooth',
					});
				} else {
					row.element.scrollIntoView({
						block: 'nearest',
					});
				}
			}
		}

		components.body.elements.group.setAttribute(
			'aria-activedescendant',
			row == null ? '' : `tabela_${this.state.id}_row_${key}`,
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
	event: KeyboardEvent,
	active: string,
	id: number,
	keys: Key[],
): number | undefined {
	const key = getKey(active.replace(`tabela_${id}_row_`, ''));

	if (key == null) {
		return;
	}

	if (absoluteKeys.has(event.key)) {
		return event.key === 'Home' ? 0 : keys.length - 1;
	}

	const index = keys.indexOf(key);
	const offset = getOffset(event.key);

	return clamp(index + offset, 0, keys.length - 1, true);
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
