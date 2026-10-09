import {isKey, isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {EVENT_DATA_SYNCHRONIZE} from '../../models/event.model';
import type {State} from '../../models/tabela.model';
import {isGroupKey} from '../group.helper';
import {addData} from './data.add';
import {clearData, removeData} from './data.remove';
import {renderData} from './data.render';
import {updateData} from './data.update';

// #region Functions

export async function synchronizeData(
	state: State,
	data: PlainObject[],
	remove: boolean,
): Promise<void> {
	if (!Array.isArray(data)) {
		return;
	}

	const {length} = data;

	if (length === 0 && remove) {
		return clearData(state, true);
	}

	const added: PlainObject[] = [];
	const updated: PlainObject[] = [];

	const keys = new Set<Key>([]);

	for (let index = 0; index < length; index += 1) {
		const object = data[index];

		if (!isPlainObject(object)) {
			continue;
		}

		const key = getValue(object, state.key);

		if (!isKey(key)) {
			continue;
		}

		if (state.managers.data.data.values.mapped.has(key)) {
			updated.push(object);
		} else {
			added.push(object);
		}

		keys.add(key);
	}

	if (keys.size === 0) {
		return;
	}

	let removed: PlainObject[] = [];

	if (remove) {
		const toRemove = state.managers.data.data.keys.original.filter(
			key => !isGroupKey(key) && !keys.has(key),
		) as Key[];

		if (toRemove.length > 0) {
			removed = await removeData(state, toRemove, false);
		}
	}

	await updateData(state, updated, added.length === 0);

	await addData(state, added, false);

	state.managers.event.herald.emit(EVENT_DATA_SYNCHRONIZE, {
		added,
		removed,
		updated,
	});

	if (added.length > 0 || remove) {
		renderData(state);
	}
}

// #endregion
