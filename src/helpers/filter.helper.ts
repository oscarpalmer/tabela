import {isNullableOrWhitespace, isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {createElement} from '@oscarpalmer/toretto/create';
import {findAncestor} from '@oscarpalmer/toretto/find';
import type {ColumnComponent} from '../models/column.model';
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
	EVENT_FILTER_REMOVE,
	EVENT_FILTER_SET,
} from '../models/event.model';
import {type TabelaFilterItem, filterComparators, filterComparisons} from '../models/filter.model';
import {RENDER_ORIGIN_FILTER} from '../models/render.model';
import {
	CSS_HEADING_FILTER,
	CSS_HEADING_FILTER_BUTTON,
	CSS_HEADING_FILTER_POPOVER,
} from '../models/style.model';
import type {State} from '../models/tabela.model';
import {render} from './render.helper';

// #region Functions

export function addFilter(state: State, item: TabelaFilterItem): void {
	const {event, filter} = state.managers;
	const {items} = filter;

	const valid = getValidFilter(item);

	if (valid == null) {
		return;
	}

	items.set(valid.key, valid);

	event.herald.emit(EVENT_FILTER_ADD, [getTabelaFilter(valid)]);

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
): HTMLDivElement {
	const id = `${prefix}_filter`;

	const filter = createElement(ELEMENT_DIV, {
		property: {
			className: CSS_HEADING_FILTER,
		},
	});

	const button = createElement('button', {
		attribute: {
			popovertarget: id,
		},
		property: {
			className: CSS_HEADING_FILTER_BUTTON,
			tabIndex: -1,
			textContent: 'F',
			type: 'button',
		},
	});

	const popover = createFilterPopover(state, column, id);

	filter.append(button, popover);

	return filter;
}

function createFilterInput(prefix: string): HTMLDivElement {
	const id = `${prefix}_input`;

	const wrapper = createElement(ELEMENT_DIV, {});

	const label = createElement('label', {
		attribute: {
			for: id,
		},
		property: {
			textContent: 'Filter',
		},
	});

	const input = createElement('input', {
		attribute: {
			[ATTRIBUTE_DATA_EVENT]: EVENT_FILTER_INPUT,
		},
		property: {
			id,
			type: 'text',
		},
	});

	wrapper.append(label, input);

	return wrapper;
}

function createFilterPopover(state: State, column: ColumnComponent, id: string): HTMLDivElement {
	const popover = createElement(ELEMENT_DIV, {
		attribute: {
			ouiPopover: '',
			popover: '',
		},
		property: {
			id,
			className: CSS_HEADING_FILTER_POPOVER,
		},
	});

	const input = createFilterInput(id);

	popover.addEventListener('toggle', () => {
		if (state.managers.filter.active.has(column.key.original)) {
			return;
		}

		state.managers.filter.active.add(column.key.original);

		void updateColumns(DATA_UPDATE_UPDATE, state, [column.key.original]).then(() => {
			console.log(state.managers.filter.cache);
		});
	});

	popover.append(input);

	return popover;
}

export function filterData(state: State): void {
	const {filter} = state.managers;

	const filters = [...filter.items].filter(([, item]) => !isNullableOrWhitespace(item.value));
	const filtersLength = filters.length;

	if (filtersLength === 0) {
		state.managers.data.data.keys.active = undefined;

		render(state, RENDER_ORIGIN_FILTER);

		return;
	}

	const keys: Set<Set<Key>> = new Set();

	for (const [key, item] of filters) {
		const cache = filter.cache.get(key);

		if (cache == null) {
			continue;
		}

		for (const [value, cached] of cache.value) {
			if (
				filterComparators[item.comparison](
					{
						raw: cached.value,
						string: value,
					},
					{
						raw: item.value,
						string: getString(item.value),
					},
				)
			) {
				keys.add(cached.keys);
			}
		}
	}

	const setsAsArray = [...keys];

	state.managers.data.data.keys.active = state.managers.data.data.keys.original.filter(
		key => state.managers.group.mapped.has(key as never) || setsAsArray.every(set => set.has(key)),
	);

	render(state, RENDER_ORIGIN_FILTER);
}

function getCacheId(): number {
	index += 1;

	return index;
}

export function getTabelaFilter(item: TabelaFilterItem): TabelaFilterItem {
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

export function onFilter(state: State, input: HTMLInputElement): void {
	const header = findAncestor(input, SELECTOR_DATA_KEY);

	if (!(header instanceof HTMLElement)) {
		return;
	}

	const key = header.dataset.key!;
	const {filter} = state.managers;

	const existing = filter.items.get(key);

	if (existing == null) {
		addFilter(state, {
			key,
			comparison: 'includes',
			value: input.value,
		});

		return;
	}

	existing.value = input.value;

	filterData(state);
}

export function removeFilter(state: State, value: string | TabelaFilterItem): void {
	const {event, filter} = state.managers;

	let existing: TabelaFilterItem | undefined;

	if (typeof value === 'string') {
		existing = filter.items.get(value);
		if (existing != null) {
			filter.items.delete(value);
		}
	} else {
		const valid = getValidFilter(value);

		if (valid == null) {
			return;
		}

		existing = filter.items.get(valid.key);

		if (existing != null) {
			filter.items.delete(valid.key);
		}
	}

	if (existing == null) {
		return;
	}

	event.herald.emit(EVENT_FILTER_REMOVE, [getTabelaFilter(existing)]);

	filterData(state);
}

export function setFilters(state: State, items: TabelaFilterItem[]): void {
	const {event, filter} = state.managers;

	const removed = [...filter.items].map(([, filter]) => getTabelaFilter(filter));

	filter.items.clear();

	const {length} = items;

	for (let index = 0; index < length; index += 1) {
		const item = items[index];

		const valid = getValidFilter(item);

		if (valid != null) {
			filter.items.set(valid.key, valid);
		}
	}

	event.herald.emit(EVENT_FILTER_SET, {
		removed,
		added: [...filter.items].map(([, filter]) => getTabelaFilter(filter)),
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

	const columnsLength = columns.length;

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
				const cached = [...cache.value].find(([, cached]) => cached.keys.has(dataKey));

				if (cached != null) {
					const [cachedKey, cachedValue] = cached;

					cachedValue.count -= 1;

					cachedValue.keys.delete(dataKey);

					if (cachedValue.count === 0) {
						cache.value.delete(cachedKey);
						cache.id.delete(cachedValue.id);
					}
				}
			}

			const value = getValue(dataItem, column);
			const asString = getString(value);

			const valued = cache.value.get(asString);

			if (valued == null) {
				const id = getCacheId();

				const cached = {
					id,
					value,
					count: 1,
					keys: new Set([dataKey]),
				};

				cache.id.set(id, cached);
				cache.value.set(asString, cached);
			} else {
				valued.count += 1;

				valued.keys.add(dataKey);
			}
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

			filter.cache.set(column.key.original, {
				id: new Map(),
				value: new Map(),
			});
		}
	}

	await updateColumns(
		type,
		state,
		columns.map(column => column.key.original),
		map,
	);

	console.dir(filter.cache);
}

// #endregion

// #region Variables

let index = 0;

// #endregion
