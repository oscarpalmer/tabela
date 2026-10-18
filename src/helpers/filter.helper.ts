import {filter} from '@oscarpalmer/atoms/array/filter';
import {find} from '@oscarpalmer/atoms/array/find';
import {select} from '@oscarpalmer/atoms/array/select';
import {isNullableOrWhitespace, isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getNumber} from '@oscarpalmer/atoms/number';
import {getString} from '@oscarpalmer/atoms/string';
import {endsWith, includes, startsWith} from '@oscarpalmer/atoms/string/match';
import {equal, type Equalizer} from '@oscarpalmer/atoms/value/equal';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {createElement} from '@oscarpalmer/toretto/create';
import {findAncestor} from '@oscarpalmer/toretto/find';
import type {
	ColumnComponent,
	ColumnComponentElementsFilter,
	ColumnComponentElementsFilterInput,
	ColumnComponentElementsFilterList,
} from '../models/column.model';
import {
	DATA_UPDATE_REMOVE,
	DATA_UPDATE_SET,
	DATA_UPDATE_UPDATE,
	type DataUpdate,
} from '../models/data.model';
import {ATTRIBUTE_DATA_EVENT, ELEMENT_DIV, SELECTOR_DATA_KEY} from '../models/dom.model';
import {
	EVENT_FILTER_ADD,
	EVENT_FILTER_CLEAR,
	EVENT_FILTER_INPUT,
	EVENT_FILTER_LIST,
	EVENT_FILTER_REMOVE,
	EVENT_FILTER_SET,
	EVENT_FILTER_UPDATE,
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
	filterComparisons,
	type FilterComparator,
	type FilterItem,
	type TabelaFilterItem,
} from '../models/filter.model';
import {RENDER_ORIGIN_FILTER} from '../models/render.model';
import {
	CSS_FILTER,
	CSS_FILTER_INPUT,
	CSS_FILTER_ITEM,
	CSS_FILTER_LABEL,
	CSS_FILTER_LIST,
	CSS_HEADING_FILTER,
} from '../models/style.model';
import type {State} from '../models/tabela.model';
import {render} from './render.helper';

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

	if (filters.length === 0) {
		return;
	}

	const added: TabelaFilterItem[] = [];
	const updated: TabelaFilterItem[] = [];

	for (const item of filters) {
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

export function createFilterElement(
	state: State,
	column: ColumnComponent,
	prefix: string,
): ColumnComponentElementsFilter {
	const id = `${prefix}_filter`;

	const button = createElement('button', {
		attribute: {
			popovertarget: id,
		},
		property: {
			className: CSS_HEADING_FILTER,
			tabIndex: -1,
			textContent: 'F',
			type: 'button',
		},
	});

	const [popover, input, list] = createFilterPopover(state, column, id);

	return {
		button,
		input,
		list,
		popover,
	};
}

function createFilterInput(prefix: string): ColumnComponentElementsFilterInput {
	const id = `${prefix}_input`;

	const item = createElement(ELEMENT_DIV, {
		property: {
			className: CSS_FILTER_ITEM,
		},
	});

	const label = createElement('label', {
		attribute: {
			for: id,
		},
		property: {
			className: CSS_FILTER_LABEL,
			textContent: 'Filter',
		},
	});

	const input = createElement('input', {
		attribute: {
			[ATTRIBUTE_DATA_EVENT]: EVENT_FILTER_INPUT,
		},
		property: {
			id,
			className: CSS_FILTER_INPUT,
			type: 'text',
		},
	});

	item.append(label, input);

	return {
		container: item,
		input,
		label,
	};
}

function createFilterList(prefix: string): ColumnComponentElementsFilterList {
	const id = `${prefix}_list`;

	const item = createElement(ELEMENT_DIV, {
		property: {
			className: CSS_FILTER_ITEM,
		},
	});

	const label = createElement('label', {
		attribute: {
			for: id,
		},
		property: {
			className: CSS_FILTER_LABEL,
			textContent: 'Filter',
		},
	});

	const input = createElement('select', {
		attribute: {
			[ATTRIBUTE_DATA_EVENT]: EVENT_FILTER_LIST,
		},
		property: {
			id,
			className: CSS_FILTER_LIST,
			multiple: true,
		},
	});

	item.append(label, input);

	return {
		container: item,
		label,
		input,
	};
}

function createFilterPopover(
	state: State,
	column: ColumnComponent,
	id: string,
): [HTMLDivElement, ColumnComponentElementsFilterInput, ColumnComponentElementsFilterList] {
	const popover = createElement(ELEMENT_DIV, {
		attribute: {
			ouiPopover: '',
			popover: '',
		},
		property: {
			id,
			className: CSS_FILTER,
		},
	});

	const input = createFilterInput(id);
	const list = createFilterList(id);

	popover.addEventListener('toggle', () => {
		if (state.managers.filter.active.has(column.key.original)) {
			return;
		}

		state.managers.filter.active.add(column.key.original);

		void updateColumns(DATA_UPDATE_UPDATE, state, [column.key.original]).then(() => {});
	});

	popover.append(input.container, list.container);

	return [popover, input, list];
}

export function filterData(state: State): void {
	const filters = [...state.managers.filter.items]
		.flatMap(([key, items]) => items.map(item => ({...item, key})))
		.filter(filter => !isNullableOrWhitespace(filter.value));

	const filtersLength = filters.length;

	if (filtersLength === 0) {
		state.managers.data.data.keys.active = undefined;

		render(state, RENDER_ORIGIN_FILTER);

		return;
	}

	const keys: Map<string, Set<Key>> = new Map();

	for (const item of filters) {
		const cache = state.managers.filter.cache.get(item.key);

		if (cache == null) {
			continue;
		}

		for (const [value, cached] of cache) {
			if (
				comparators[item.comparison](state, item, {
					item: cached,
					asString: value,
				})
			) {
				keys.set(item.key, keys.get(item.key)?.union(cached.keys) ?? cached.keys);
			}
		}
	}

	let set = new Set<Key>();

	for (const [, value] of keys) {
		set = set.union(value);
	}

	state.managers.data.data.keys.active = filter(
		state.managers.data.data.keys.original,
		key => state.managers.group.mapped.has(key as never) || set.has(key),
	);

	render(state, RENDER_ORIGIN_FILTER);
}

function getCacheId(): string {
	index += 1;

	return `${index}`;
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

export function onFilter(state: State, input: Element): void {
	const header = findAncestor(input, SELECTOR_DATA_KEY);

	if (!(header instanceof HTMLElement)) {
		return;
	}

	const isSelect = input instanceof HTMLSelectElement;

	if (!(input instanceof HTMLInputElement) && !isSelect) {
		return;
	}

	const {filter} = state.managers;

	const value = isSelect ? [...input.selectedOptions].map(option => option.value) : input.value;

	const key = header.dataset.key!;

	const filters = filter.items.get(key) ?? [];
	const existing = filters.find(filter => filter.id === EVENT_FILTER_UPDATE);

	if (existing == null) {
		addFilters(
			state,
			{
				key,
				value,
				comparison: FILTER_INCLUDES,
			},
			EVENT_FILTER_UPDATE,
		);

		return;
	}

	existing.asString = getString(value);
	existing.value = value;

	filterData(state);
}

export function removeFilter(state: State, value: string | string[]): void {
	const {event} = state.managers;

	const keys = filter(Array.isArray(value) ? value : [value], item => typeof item === 'string');

	const removed: TabelaFilterItem[] = [];

	for (const key of keys) {
		const existing = state.managers.filter.items.get(key);

		if (existing != null) {
			state.managers.filter.items.delete(key);

			removed.push(...existing.map(getTabelaFilter));
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

	const added: TabelaFilterItem[] = [];

	if (input.length > 0) {
		for (const item of input) {
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

async function updateColumns(
	type: DataUpdate,
	state: State,
	columns: string[],
	map?: Map<Key, string | PlainObject>,
): Promise<void> {
	const {filter} = state.managers;

	const data = map ?? state.managers.data.data.values.mapped;

	let columnsLength = columns.length;

	for (const [dataKey, dataItem] of data) {
		if (typeof dataItem === 'string') {
			continue;
		}

		for (let columnIndex = 0; columnIndex < columnsLength; columnIndex += 1) {
			const column = columns[columnIndex];

			if (!filter.active.has(column)) {
				continue;
			}

			const cache = filter.cache.get(column)!;

			if (type === DATA_UPDATE_REMOVE || type === DATA_UPDATE_UPDATE) {
				const cached = find([...cache.entries()], ([, cached]) => cached.keys.has(dataKey));

				if (cached != null) {
					const [cachedKey, cachedValue] = cached;

					cachedValue.count -= 1;

					cachedValue.keys.delete(dataKey);

					if (cachedValue.count === 0) {
						cache.delete(cachedKey);
					}
				}
			}

			const value = getValue(dataItem, column, state.options.relaxedKeys);
			const asString = getString(value);

			let cached = cache.get(asString);

			if (cached == null) {
				const id = getCacheId();

				cached = {
					id,
					value,
					count: 1,
					keys: new Set([dataKey]),
				};

				cache.set(asString, cached);
			} else {
				cached.count += 1;

				cached.keys.add(dataKey);
			}
		}
	}

	columnsLength = state.managers.column.items.length;

	for (let columnIndex = 0; columnIndex < columnsLength; columnIndex += 1) {
		const column = state.managers.column.items[columnIndex];
		const cached = filter.cache.get(column.key.original);

		const list =
			cached != null &&
			((cached?.size > 0 && cached?.size <= 100) || column.options.type === 'boolean');

		column.elements.filter.input.container.hidden = list;
		column.elements.filter.list.container.hidden = !list;

		if (list) {
			column.elements.filter.list.input.size = cached.size;

			column.elements.filter.list.input.innerHTML = [...cached.entries()]
				.map(([key, value]) => `<option value="${value.id}">${key}</option>`)
				.join('');
		} else {
			column.elements.filter.list.input.innerHTML = '';
			column.elements.filter.list.input.size = 0;
		}
	}
}

export async function updateFilterCache(
	type: DataUpdate,
	state: State,
	map?: Map<Key, PlainObject>,
): Promise<void> {
	const {column, filter} = state.managers;

	const columns = column.items;

	if (type === DATA_UPDATE_SET || filter.cache.size === 0) {
		filter.cache.clear();

		const columnsLength = columns.length;

		for (let columnIndex = 0; columnIndex < columnsLength; columnIndex += 1) {
			const column = columns[columnIndex];

			filter.cache.set(column.key.original, new Map());
		}
	}

	return updateColumns(
		type,
		state,
		columns.map(column => column.key.original),
		map,
	);
}

// #endregion

// #region Variables

const comparators: Record<string, FilterComparator> = {
	[FILTER_ENDS_WITH]: (state, filter, value) =>
		endsWith(value.asString, filter.asString, state.options.relaxedKeys),
	[FILTER_EQUALS]: (_, filter, value) => equalizer.compare(value.item.value, filter.value),
	[FILTER_GREATER_THAN]: (_, filter, value) =>
		getNumber(value.item.value) > getNumber(filter.value),
	[FILTER_GREATER_THAN_OR_EQUAL]: (_, filter, value) =>
		getNumber(value.item.value) >= getNumber(filter.value),
	[FILTER_INCLUDES]: (state, filter, value) => {
		if (Array.isArray(filter.value)) {
			return filter.value.includes(value.item.id);
		}

		return includes(value.asString, filter.asString, state.options.relaxedKeys);
	},
	[FILTER_LESS_THAN]: (_, filter, value) => getNumber(value.item.value) < getNumber(filter.value),
	[FILTER_LESS_THAN_OR_EQUAL]: (_, filter, value) =>
		getNumber(value.item.value) <= getNumber(filter.value),
	[FILTER_NOT_EQUALS]: (_, filter, value) => !equalizer.compare(value.item.value, filter.value),
	[FILTER_NOT_INCLUDES]: (state, filter, value) =>
		!includes(value.asString, filter.asString, state.options.relaxedKeys),
	[FILTER_STARTS_WITH]: (state, filter, value) =>
		startsWith(value.asString, filter.asString, state.options.relaxedKeys),
};

const equalizer: Equalizer = equal.initialize({
	ignoreCase: true,
});

let index = 0;

// #endregion
