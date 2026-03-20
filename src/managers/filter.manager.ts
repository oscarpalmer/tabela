import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
import {getNumber} from '@oscarpalmer/atoms/number';
import {getString} from '@oscarpalmer/atoms/string';
import {endsWith, includes, startsWith} from '@oscarpalmer/atoms/string/match';
import {equal} from '@oscarpalmer/atoms/value/equal';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {getFilter, getValidFilter, isGroupKey} from '../helpers/misc.helpers';
import {
	EVENT_FILTER_ADD,
	EVENT_FILTER_CLEAR,
	EVENT_FILTER_REMOVE,
	EVENT_FILTER_SET,
} from '../models/event.model';
import {
	FILTER_ENDS_WITH,
	FILTER_EQUALS,
	FILTER_GREATER_THAN,
	FILTER_GREATER_THAN_OR_EQUAL,
	FILTER_INCLUDES,
	FILTER_LESS_THAN,
	FILTER_LESS_THAN_OR_EQUAL,
	FILTER_NOT_EQUALS,
	FILTER_NOT_INCLUDES,
	FILTER_STARTS_WITH,
	type TabelaFilter,
	type TabelaFilterItem,
} from '../models/filter.model';
import {RENDER_ORIGIN_FILTER} from '../models/render.model';
import type {State} from '../models/tabela.model';

export class FilterManager {
	handlers: TabelaFilter = {
		add: item => this.add(item),
		clear: () => this.clear(),
		remove: value => this.remove(value),
		set: items => this.set(items),
	};

	items: Record<string, TabelaFilterItem[]> = {};

	constructor(public state: State) {}

	add(item: TabelaFilterItem): void {
		const {items, state} = this;

		const filter = getValidFilter(item);

		if (filter == null) {
			return;
		}

		if (items[filter.key] == null) {
			items[filter.key] = [];
		} else {
			const index = items[filter.key].findIndex(existing => equal(existing, filter));

			if (index > -1) {
				return;
			}
		}

		items[filter.key].push(filter);

		state.managers.event.emit(EVENT_FILTER_ADD, [getFilter(filter)]);

		this.filter();
	}

	clear(): void {
		if (Object.keys(this.items).length === 0) {
			return;
		}

		this.items = {};

		this.state.managers.event.emit(EVENT_FILTER_CLEAR);

		this.filter();
	}

	destroy(): void {
		this.handlers = undefined as never;
		this.items = undefined as never;
		this.state = undefined as never;
	}

	filter(): void {
		const {state} = this;

		const filters = Object.entries(this.items);

		if (filters.length === 0) {
			state.managers.data.state.keys.active = undefined;

			state.managers.render.render(RENDER_ORIGIN_FILTER);

			return;
		}

		const {keys} = state.managers.data;
		const keysLength = keys.length;

		const filtered: Key[] = [];

		outer: for (let itemIndex = 0; itemIndex < keysLength; itemIndex += 1) {
			const key = keys[itemIndex];

			if (isGroupKey(key)) {
				filtered.push(key);

				continue;
			}

			const row = state.managers.data.state.values.mapped.get(key);

			if (row == null) {
				continue;
			}

			for (let filterIndex = 0; filterIndex < filters.length; filterIndex += 1) {
				const [, items] = filters[filterIndex];

				const value = getValue(row, items[0].key, true);

				for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
					const filter = items[itemIndex];

					if (
						isNullableOrWhitespace(filter.value) ||
						comparators[filter.comparison](value, filter.value)
					) {
						filtered.push(key);

						continue outer;
					}
				}
			}
		}

		state.managers.data.state.keys.active = filtered;

		state.managers.render.render(RENDER_ORIGIN_FILTER);
	}

	remove(value: string | TabelaFilterItem): void {
		const removed: TabelaFilterItem[] = [];

		if (typeof value === 'string') {
			if (this.items[value] == null) {
				return;
			}

			const keyed: Record<string, TabelaFilterItem[]> = {};

			const keys = Object.keys(this.items);
			const {length} = keys;

			for (let index = 0; index < length; index += 1) {
				const key = keys[index];

				if (key === value) {
					removed.push(...this.items[key]);
				} else {
					keyed[key] = this.items[key];
				}
			}

			this.items = keyed;
		} else {
			const filter = getValidFilter(value);

			if (filter == null) {
				return;
			}

			const {key} = filter;

			if (this.items[key] == null) {
				return;
			}

			const index = this.items[key].findIndex(item => equal(item, filter));

			if (index === -1) {
				return;
			}

			removed.push(this.items[key][index]);
		}

		this.state.managers.event.emit(EVENT_FILTER_REMOVE, removed.map(getFilter));

		this.filter();
	}

	set(items: TabelaFilterItem[]): void {
		const keyed: Record<string, TabelaFilterItem[]> = {};

		const removed = Object.values(this.items).flatMap(filters => filters.map(getFilter));

		const filters = items.map(getValidFilter).filter(item => item != null) as TabelaFilterItem[];

		const {length} = filters;

		for (let index = 0; index < length; index += 1) {
			const item = filters[index];

			keyed[item.key] ??= [];

			keyed[item.key].push(item);
		}

		this.items = keyed;

		this.state.managers.event.emit(EVENT_FILTER_SET, {
			removed,
			added: filters.map(getFilter),
		});

		this.filter();
	}

	update(): void {}
}

const comparators: Record<string, (row: unknown, filter: unknown) => boolean> = {
	[FILTER_ENDS_WITH]: (row, filter) => endsWith(getString(row), getString(filter), true),
	[FILTER_EQUALS]: (row, filter) => equalizer(row, filter),
	[FILTER_GREATER_THAN]: (row, filter) => getNumber(row) > getNumber(filter),
	[FILTER_GREATER_THAN_OR_EQUAL]: (row, filter) => getNumber(row) >= getNumber(filter),
	[FILTER_INCLUDES]: (row, filter) => includes(getString(row), getString(filter), true),
	[FILTER_LESS_THAN]: (row, filter) => getNumber(row) < getNumber(filter),
	[FILTER_LESS_THAN_OR_EQUAL]: (row, filter) => getNumber(row) <= getNumber(filter),
	[FILTER_NOT_EQUALS]: (row, filter) => !equalizer(row, filter),
	[FILTER_NOT_INCLUDES]: (row, filter) => !includes(getString(row), getString(filter), true),
	[FILTER_STARTS_WITH]: (row, filter) => startsWith(getString(row), getString(filter), true),
};

const equalizer = equal.initialize({
	ignoreCase: true,
});
