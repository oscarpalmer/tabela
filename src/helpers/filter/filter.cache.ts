import {find} from '@oscarpalmer/atoms/array/find';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {
	type DataUpdate,
	DATA_UPDATE_REMOVE,
	DATA_UPDATE_SET,
	DATA_UPDATE_UPDATE,
} from '../../models/data.model';
import type {State} from '../../models/tabela.model';

// #region Functions

function getCacheId(): string {
	index += 1;

	return `${index}`;
}

export async function updateFilterableColumns(
	type: DataUpdate,
	state: State,
	columns: string[],
	map?: Map<Key, string | PlainObject>,
): Promise<void> {
	const {data, filter} = state.managers;

	const dataEntries = [...(map ?? data.store.values.mapped).entries()];
	const dataLength = dataEntries.length;

	let columnsLength = columns.length;

	for (let dataIndex = 0; dataIndex < dataLength; dataIndex += 1) {
		const [dataKey, dataItem] = dataEntries[dataIndex];

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

		if (column.elements.filter == null) {
			continue;
		}

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

	return updateFilterableColumns(
		type,
		state,
		columns.map(column => column.key.original),
		map,
	);
}

// #endregion

// #region Variables

let index = 0;

// #endregion
