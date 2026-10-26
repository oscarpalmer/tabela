import {isKey, isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {DATA_UPDATE_UPDATE} from '../../models/data.model';
import {EVENT_DATA_UPDATE} from '../../models/event.model';
import type {State} from '../../models/tabela.model';
import {updateFilterCache} from '../filter/filter.cache';
import {updateRow} from '../row.helper';

// #region Functions

export async function updateData(
	state: State,
	items: PlainObject[],
	render: boolean,
): Promise<void> {
	if (!Array.isArray(items)) {
		return;
	}

	const {length} = items;

	if (length === 0) {
		return;
	}

	const {key, managers, options} = state;
	const {data, event} = managers;
	const {store} = data;

	const map = new Map<Key, PlainObject>();
	const updated: PlainObject[] = [];

	for (let index = 0; index < length; index += 1) {
		const item = items[index];

		if (!isPlainObject(item)) {
			continue;
		}

		const itemKey = getValue(item, key, options.relaxedKeys);

		if (!isKey(itemKey)) {
			continue;
		}

		const existingIndex = store.keys.all.original.indexOf(itemKey);
		const existingItem = store.values.array[existingIndex];

		if (!isPlainObject(existingItem)) {
			continue;
		}

		Object.assign(existingItem, item);

		map.set(itemKey, existingItem);
		updated.push(existingItem);

		if (render && managers.render.visible.keys.has(itemKey)) {
			updateRow(state, itemKey);
		}
	}

	if (updated.length > 0) {
		event.herald.emit(EVENT_DATA_UPDATE, updated);
	}

	return updateFilterCache(DATA_UPDATE_UPDATE, state, map);
}

// #endregion
