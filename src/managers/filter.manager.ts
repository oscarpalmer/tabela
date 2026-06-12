import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
import {getNumber} from '@oscarpalmer/atoms/number';
import {getString} from '@oscarpalmer/atoms/string';
import {endsWith, includes, startsWith} from '@oscarpalmer/atoms/string/match';
import {equal} from '@oscarpalmer/atoms/value/equal';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {getTabelaFilter, getValidFilter, isGroupKey} from '../helpers/misc.helpers';
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
import {render} from './render.manager';

// #region Types

export class FilterManager {
	handlers: TabelaFilter = {
		add: item => addFilter(this.state, item),
		clear: () => clearFilters(this.state),
		remove: value => removeFilter(this.state, value),
		set: items => setFilters(this.state, items),
	};

	items: Record<string, TabelaFilterItem[]> = {};

	constructor(public state: State) {}

	destroy(): void {
		this.handlers = undefined as never;
		this.items = undefined as never;
		this.state = undefined as never;
	}
}

// #endregion

// #region Functions

function addFilter(state: State, item: TabelaFilterItem): void {
	const {event, filter} = state.managers;
	const {items} = filter;

	const valid = getValidFilter(item);

	if (valid == null) {
		return;
	}

	if (items[valid.key] == null) {
		items[valid.key] = [];
	} else {
		const index = items[valid.key].findIndex(existing => equal(existing, valid));

		if (index > -1) {
			return;
		}
	}

	items[valid.key].push(valid);

	event.herald.emit(EVENT_FILTER_ADD, [getTabelaFilter(valid)]);

	filterData(state);
}

function clearFilters(state: State): void {
	const {event, filter} = state.managers;

	if (Object.keys(filter.items).length === 0) {
		return;
	}

	filter.items = {};

	event.herald.emit(EVENT_FILTER_CLEAR);

	filterData(state);
}

export function filterData(state: State): void {
	const {filter} = state.managers;

	const filters = Object.entries(filter.items);

	if (filters.length === 0) {
		state.managers.data.state.keys.active = undefined;

		render(state, RENDER_ORIGIN_FILTER);

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

	render(state, RENDER_ORIGIN_FILTER);
}

function removeFilter(state: State, value: string | TabelaFilterItem): void {
	const {event, filter} = state.managers;

	const removed: TabelaFilterItem[] = [];

	if (typeof value === 'string') {
		if (filter.items[value] == null) {
			return;
		}

		const keyed: Record<string, TabelaFilterItem[]> = {};

		const keys = Object.keys(filter.items);
		const {length} = keys;

		for (let index = 0; index < length; index += 1) {
			const key = keys[index];

			if (key === value) {
				removed.push(...filter.items[key]);
			} else {
				keyed[key] = filter.items[key];
			}
		}

		filter.items = keyed;
	} else {
		const valid = getValidFilter(value);

		if (valid == null) {
			return;
		}

		const {key} = valid;

		if (filter.items[key] == null) {
			return;
		}

		const index = filter.items[key].findIndex(item => equal(item, valid));

		if (index === -1) {
			return;
		}

		removed.push(filter.items[key][index]);
	}

	event.herald.emit(EVENT_FILTER_REMOVE, removed.map(getTabelaFilter));

	filterData(state);
}

function setFilters(state: State, items: TabelaFilterItem[]): void {
	const {event, filter} = state.managers;

	const keyed: Record<string, TabelaFilterItem[]> = {};

	const removed = Object.values(filter.items).flatMap(filters => filters.map(getTabelaFilter));

	const filters = items.map(getValidFilter).filter(item => item != null) as TabelaFilterItem[];

	const {length} = filters;

	for (let index = 0; index < length; index += 1) {
		const item = filters[index];

		keyed[item.key] ??= [];

		keyed[item.key].push(item);
	}

	filter.items = keyed;

	event.herald.emit(EVENT_FILTER_SET, {
		removed,
		added: filters.map(getTabelaFilter),
	});

	filterData(state);
}

function updateFilters(state: State): void {}

// #endregion

// #region Variables

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

// #endregion

// #region Variables

const equalizer = equal.initialize({
	ignoreCase: true,
});

// #endregion
