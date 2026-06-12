import {chunk} from '@oscarpalmer/atoms/array';
import {isKey, isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {delay} from '@oscarpalmer/atoms/promise/delay';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {type GroupComponent} from '../../components/group.component';
import {removeRow} from '../../components/row.component';
import {isGroupKey} from '../../helpers/misc.helpers';
import type {DataState} from '../../models/data.model';
import {
	EVENT_DATA_CLEAR,
	EVENT_DATA_REMOVE,
	EVENT_DATA_SYNCHRONIZE,
} from '../../models/event.model';
import {clearGroups, getGroup, removeGroups, updateGroups} from '../group.manager';
import {clearRows} from '../row.manager';
import {renderData} from './data.render';

// #region Functions

export async function clearData(state: DataState, synchronize: boolean): Promise<void> {
	return removeItems(state, [], true, synchronize, true).then(() => undefined);
}

export async function removeData(
	state: DataState,
	items: Array<Key | PlainObject>,
	render: false,
): Promise<PlainObject[]>;

export async function removeData(
	state: DataState,
	items: Array<Key | PlainObject>,
	render: true,
): Promise<void>;

export async function removeData(
	state: DataState,
	items: Array<Key | PlainObject>,
	render: boolean,
): Promise<unknown> {
	const keys = items
		.map(value => (isPlainObject(value) ? getValue(value, state.key) : value) as Key)
		.filter(key => isKey(key) && !isGroupKey(key));

	const {length} = keys;

	if (length === 0) {
		return render ? undefined : [];
	}

	return removeItems(state, keys, false, false, render as never);
}

async function removeItems(
	state: DataState,
	data: Key[],
	clear: boolean,
	synchronize: boolean,
	render: false,
): Promise<PlainObject[]>;

async function removeItems(
	state: DataState,
	data: Key[],
	clear: boolean,
	synchronize: boolean,
	render: true,
): Promise<void>;

async function removeItems(
	state: DataState,
	keys: Key[],
	clear: boolean,
	synchronize: boolean,
	render: boolean,
): Promise<unknown> {
	if (clear) {
		state.keys.active = undefined;
		state.keys.original = [];
		state.values.array = [];

		state.values.mapped.clear();

		clearRows(state);

		if (state.managers.group.enabled) {
			clearGroups(state);
		}

		state.managers.event.herald.emit(EVENT_DATA_CLEAR);

		renderData(state);

		return render ? undefined : [];
	}

	const removedGroups: GroupComponent[] = [];
	const updatedGroups: GroupComponent[] = [];

	const removedData: PlainObject[] = [];

	const chunked = chunk(keys);
	const chunkedLength = chunked.length;

	for (let chunkedIndex = 0; chunkedIndex < chunkedLength; chunkedIndex += 1) {
		const chunk = chunked[chunkedIndex];
		const chunkLength = chunk.length;

		for (let keyIndex = 0; keyIndex < chunkLength; keyIndex += 1) {
			const key = chunk[keyIndex];
			const dataIndex = state.keys.original.indexOf(key);

			let dataValue: PlainObject | undefined;

			[dataValue] = state.values.array.splice(dataIndex, 1) as PlainObject[];

			removedData.push(dataValue);

			state.keys.original.splice(dataIndex, 1);

			const row = state.managers.row.components.get(key);

			if (row != null) {
				removeRow(state, row, true);
			}

			state.values.mapped.delete(key);

			if (!state.managers.group.enabled || isGroupKey(key)) {
				continue;
			}

			state.managers.group.collapsed.delete(key);

			const groupValue = getValue(dataValue, state.managers.group.key) as unknown;

			const group = getGroup(state, groupValue, true);

			if (group == null || removedGroups.includes(group)) {
				continue;
			}

			group.total -= 1;

			if (group.total > 0) {
				const groupIndex = updatedGroups.indexOf(group);

				if (groupIndex === -1) {
					updatedGroups.push(group);
				}

				continue;
			}

			let groupIndex = updatedGroups.indexOf(group);

			if (groupIndex > -1) {
				updatedGroups.splice(groupIndex, 1);
			}

			groupIndex = state.values.array.indexOf(group.key.full);

			if (groupIndex > -1) {
				state.keys.original.splice(groupIndex, 1);
				state.values.array.splice(groupIndex, 1);
			}

			removedGroups.push(group);

			if (keys.length >= 10_000) {
				await delay(25);
			}
		}
	}

	removeGroups(state, removedGroups);
	updateGroups(state, updatedGroups);

	state.managers.event.herald.emit(EVENT_DATA_REMOVE, removedData);

	if (synchronize) {
		state.managers.event.herald.emit(EVENT_DATA_SYNCHRONIZE, {
			added: [],
			removed: removedData,
			updated: [],
		});
	}

	if (render) {
		renderData(state);
	}

	return render ? undefined : removedData;
}

// #endregion
