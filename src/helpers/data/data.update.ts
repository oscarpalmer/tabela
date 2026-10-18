import {isKey, isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {DATA_UPDATE_UPDATE} from '../../models/data.model';
import {EVENT_DATA_UPDATE} from '../../models/event.model';
import type {State} from '../../models/tabela.model';
import {updateFilterCache} from '../filter.helper';
import {updateRow} from '../row.helper';

// #region Functions

export async function updateData(
	state: State,
	data: PlainObject[],
	render: boolean,
): Promise<void> {
	if (!Array.isArray(data) || data.length === 0) {
		return;
	}

	const {length} = data;

	const map = new Map<Key, PlainObject>();
	const updated: PlainObject[] = [];

	for (let dataIndex = 0; dataIndex < length; dataIndex += 1) {
		const dataItem = data[dataIndex];

		if (!isPlainObject(dataItem)) {
			continue;
		}

		const key = getValue(dataItem, state.key, state.options.relaxedKeys);

		if (!isKey(key)) {
			continue;
		}

		const existingIndex = state.managers.data.data.keys.original.indexOf(key);
		const existingItem = state.managers.data.data.values.array[existingIndex];

		if (!isPlainObject(existingItem)) {
			continue;
		}

		Object.assign(existingItem, dataItem);

		map.set(key, existingItem);
		updated.push(existingItem);

		if (render && state.managers.render.visible.keys.has(key)) {
			updateRow(state, key);
		}
	}

	if (updated.length > 0) {
		state.managers.event.herald.emit(EVENT_DATA_UPDATE, updated);
	}

	return updateFilterCache(DATA_UPDATE_UPDATE, state, map);
}

// #endregion
