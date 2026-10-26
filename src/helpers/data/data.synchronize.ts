import {filter} from '@oscarpalmer/atoms/array/filter';
import {isKey, isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {EVENT_DATA_SYNCHRONIZE} from '../../models/event.model';
import type {State} from '../../models/tabela.model';
import {isGroupKey} from '../group/group.misc';
import {addData} from './data.add';
import {clearData, removeData} from './data.remove';
import {renderData} from './data.render';
import {updateData} from './data.update';

// #region Functions

export async function synchronizeData(
	state: State,
	items: PlainObject[],
	remove: boolean,
): Promise<void> {
	if (!Array.isArray(items)) {
		return;
	}

	const {length} = items;

	if (length === 0 && remove) {
		return clearData(state);
	}

	const {key, managers, options} = state;
	const {data, event} = managers;
	const {store} = data;

	const added: PlainObject[] = [];
	const updated: PlainObject[] = [];

	const keys = new Set<Key>([]);

	for (let index = 0; index < length; index += 1) {
		const item = items[index];

		if (!isPlainObject(item)) {
			continue;
		}

		const itemKey = getValue(item, key, options.relaxedKeys);

		if (!isKey(itemKey)) {
			continue;
		}

		if (managers.data.store.values.mapped.has(itemKey)) {
			updated.push(item);
		} else {
			added.push(item);
		}

		keys.add(itemKey);
	}

	if (keys.size === 0) {
		return;
	}

	let removed: PlainObject[] = [];

	if (remove) {
		const toRemove = filter(
			store.keys.all.original,
			key => !isGroupKey(key) && !keys.has(key),
		) as Key[];

		if (toRemove.length > 0) {
			removed = await removeData(state, toRemove, false);
		}
	}

	await updateData(state, updated, added.length === 0);
	await addData(state, added, false);

	event.herald.emit(EVENT_DATA_SYNCHRONIZE, {
		added,
		removed,
		updated,
	});

	if (added.length > 0 || remove) {
		renderData(state);
	}
}

// #endregion
