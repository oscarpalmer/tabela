import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import {clamp} from '@oscarpalmer/atoms/number';
import {getKey} from '../helpers/misc.helpers';
import type {DataItem} from '../models/data.model';
import type {State} from '../models/tabela.model';
import {GroupComponent} from '../components/group.component';
import {ARIA_ACTIVEDESCENDANT, ATTRIBUTE_DATA_ACTIVE} from '../models/dom.model';

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

		const {components, managers} = this.state;

		const activeDescendant = components.body.elements.group.getAttribute(ARIA_ACTIVEDESCENDANT);

		const {items} = managers.data;
		const {length} = items;

		let next: number;

		if (isNullableOrWhitespace(activeDescendant)) {
			next = getDefaultIndex(event.key, length);
		} else {
			next = getIndex(this.state, event, activeDescendant)!;
		}

		if (next != null) {
			this.setActive(items.at(next));
		}
	}

	setActive(item: DataItem | undefined, scroll?: boolean): void {
		const {components, managers, options, prefix} = this.state;

		this.active = item;

		const active = components.body.elements.group.querySelectorAll(attributeDataActiveTrue);

		for (const item of active) {
			item.setAttribute(ATTRIBUTE_DATA_ACTIVE, 'false');
		}

		const component = item instanceof GroupComponent ? item : managers.row.get(item!, false);

		if (component != null) {
			component.element?.setAttribute(ATTRIBUTE_DATA_ACTIVE, 'true');

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
			ARIA_ACTIVEDESCENDANT,
			component == null ? '' : `${prefix}${component.key}`,
		);
	}
}

function getDefaultIndex(key: string, max: number): number {
	switch (true) {
		case negativeDefaultKeys.has(key):
			return -1;

		case key === KEY_PAGE_DOWN:
			return Math.min(9, max - 1);

		case key === KEY_PAGE_UP:
			return max < 10 ? 0 : max - 10;

		default:
			return 0;
	}
}

function getIndex(state: State, event: KeyboardEvent, active: string): number | undefined {
	const key = getKey(active.replace(state.prefix, ''));

	if (key == null) {
		return;
	}

	if (absoluteKeys.has(event.key)) {
		return event.key === KEY_HOME ? 0 : state.managers.data.size - 1;
	}

	const index = state.managers.data.getIndex(key);

	return clamp(index + (offset[event.key] ?? 0), 0, state.managers.data.size - 1, true);
}

const KEY_ARROW_DOWN = 'ArrowDown';

const KEY_ARROW_UP = 'ArrowUp';

const KEY_END = 'End';

const KEY_HOME = 'Home';

const KEY_PAGE_DOWN = 'PageDown';

const KEY_PAGE_UP = 'PageUp';

const absoluteKeys = new Set([KEY_END, KEY_HOME]);

const arrowKeys = new Set([KEY_ARROW_DOWN, KEY_ARROW_UP]);

export const attributeDataActiveTrue = `[${ATTRIBUTE_DATA_ACTIVE}="true"]`;

const negativeDefaultKeys = new Set([KEY_ARROW_UP, KEY_END]);

const offset: Record<string, number> = {
	[KEY_ARROW_DOWN]: 1,
	[KEY_ARROW_UP]: -1,
	[KEY_PAGE_DOWN]: 10,
	[KEY_PAGE_UP]: -10,
};

const pageKeys = new Set([KEY_PAGE_DOWN, KEY_PAGE_UP]);

const allKeys = new Set([...absoluteKeys, ...arrowKeys, ...pageKeys]);
