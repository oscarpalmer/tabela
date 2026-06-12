import {isKey, isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import type {DataState} from '../../models/data.model';
import {EVENT_DATA_UPDATE} from '../../models/event.model';
import {updateRow} from '../row.manager';

// #region Functions

export async function updateData(
	state: DataState,
	data: PlainObject[],
	render: boolean,
): Promise<void> {
	if (!Array.isArray(data) || data.length === 0) {
		return;
	}

	const {length} = data;

	const updated: PlainObject[] = [];

	for (let index = 0; index < length; index += 1) {
		const item = data[index];

		if (!isPlainObject(item)) {
			continue;
		}

		const key = getValue(item, state.key);

		if (!isKey(key)) {
			continue;
		}

		const existing = state.keys.original.indexOf(key);

		if (existing === -1) {
			continue;
		}

		Object.assign(state.values.array[existing], item);

		updated.push(state.values.array[existing] as PlainObject);

		if (render && state.managers.render.visible.keys.has(key)) {
			updateRow(state, key);
		}
	}

	if (updated.length > 0) {
		state.managers.event.herald.emit(EVENT_DATA_UPDATE, updated);
	}
}

// #endregion
