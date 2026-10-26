import {filter} from '@oscarpalmer/atoms/array/filter';
import {select} from '@oscarpalmer/atoms/array/select';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import {getString} from '@oscarpalmer/atoms/string';
import {
	EVENT_FILTER_ADD,
	EVENT_FILTER_CLEAR,
	EVENT_FILTER_REMOVE,
	EVENT_FILTER_SET,
	EVENT_FILTER_UPDATE,
} from '../../models/event.model';
import {type FilterItem, type TabelaFilterItem, filterComparisons} from '../../models/filter.model';
import type {State} from '../../models/tabela.model';
import {filterData} from './filter.data';

// #region Functions

export function addFilters(
	state: State,
	value: TabelaFilterItem | TabelaFilterItem[],
	id?: string,
): void {
	const {event, filter} = state.managers;
	const {items} = filter;

	const filters = select.reverse(
		Array.isArray(value) ? value : [value],
		getValidFilter,
		item => item != null,
	) as TabelaFilterItem[];

	const {length} = filters;

	if (length === 0) {
		return;
	}

	const added: TabelaFilterItem[] = [];
	const updated: TabelaFilterItem[] = [];

	for (let index = 0; index < length; index += 1) {
		const item = filters[index];
		const existingItems = items.get(item.key) ?? [];

		let existingItem: FilterItem | undefined;

		if (id != null) {
			existingItem = existingItems.find(filter => filter.id === id);
		}

		if (existingItem == null) {
			added.push(item);

			items.set(item.key, [
				...existingItems,
				{
					...item,
					id,
					asString: getString(item.value),
				},
			]);
		} else {
			updated.push(item);

			existingItem.asString = getString(item.value);
			existingItem.value = item.value;
		}
	}

	if (updated.length > 0) {
		event.herald.emit(EVENT_FILTER_UPDATE, updated.map(getTabelaFilter));
	}

	if (added.length > 0) {
		event.herald.emit(EVENT_FILTER_ADD, added.map(getTabelaFilter));
	}

	filterData(state);
}

export function clearFilters(state: State): void {
	const {event, filter} = state.managers;

	filter.items.clear();

	event.herald.emit(EVENT_FILTER_CLEAR);

	filterData(state);
}

export function getTabelaFilter(item: FilterItem | TabelaFilterItem): TabelaFilterItem {
	return {
		comparison: item.comparison,
		key: item.key,
		value: item.value,
	};
}

function getValidFilter(value: unknown): TabelaFilterItem | undefined {
	if (!isPlainObject(value)) {
		return;
	}

	const filter = value as TabelaFilterItem;

	if (typeof filter.key !== 'string' || filter.key.trim().length === 0) {
		return;
	}

	if (!filterComparisons.has(filter.comparison)) {
		return;
	}

	return {
		comparison: filter.comparison,
		key: filter.key,
		value: filter.value,
	};
}

export function removeFilter(state: State, value: string | string[]): void {
	const {event} = state.managers;

	const keys = filter(Array.isArray(value) ? value : [value], item => typeof item === 'string');
	const {length} = keys;

	const removed: TabelaFilterItem[] = [];

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		const item = state.managers.filter.items.get(key);

		if (item != null) {
			state.managers.filter.items.delete(key);

			removed.push(...item.map(getTabelaFilter));
		}
	}

	if (removed.length > 0) {
		event.herald.emit(EVENT_FILTER_REMOVE, removed);
	}

	filterData(state);
}

export function setFilters(state: State, value: TabelaFilterItem | TabelaFilterItem[]): void {
	const {event, filter} = state.managers;

	const removed = [...filter.items].flatMap(([, filters]) => filters.map(getTabelaFilter));

	filter.items.clear();

	const input = (Array.isArray(value) ? value : [value]).map(getTabelaFilter);
	const {length} = input;

	const added: TabelaFilterItem[] = [];

	if (length > 0) {
		for (let index = 0; index < length; index += 1) {
			const item = input[index];

			added.push(item);

			filter.items.set(item.key, [
				...(filter.items.get(item.key) ?? []),
				{
					...item,
					asString: getString(item.value),
				},
			]);
		}
	}

	event.herald.emit(EVENT_FILTER_SET, {
		removed,
		added: added.map(getTabelaFilter),
	});

	filterData(state);
}

// #endregion
