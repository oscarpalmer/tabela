import {select} from '@oscarpalmer/atoms/array/select';
import {isKey, isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {DATA_UPDATE_REMOVE, DATA_UPDATE_SET} from '../../models/data.model';
import {
	EVENT_DATA_CLEAR,
	EVENT_DATA_REMOVE,
	EVENT_DATA_SYNCHRONIZE,
} from '../../models/event.model';
import type {GroupComponent} from '../../models/group.model';
import type {State} from '../../models/tabela.model';
import {updateFilterCache} from '../filter/filter.cache';
import {updateGroups} from '../group/group.dom';
import {clearGroups, getGroup, removeGroups} from '../group/group.item';
import {isGroupKey} from '../group/group.misc';
import {clearRows, removeRow} from '../row.helper';
import {renderData} from './data.render';

// #region Functions

async function clearItems(state: State, render: boolean): Promise<unknown> {
	const {managers} = state;
	const {data, event, group} = managers;
	const {store} = data;

	store.keys.all = {original: []};
	store.keys.row = {original: []};

	store.values.array = [];

	store.values.mapped.clear();

	clearRows(state);

	if (group.enabled) {
		clearGroups(state);
	}

	event.herald.emit(EVENT_DATA_CLEAR);

	void updateFilterCache(DATA_UPDATE_SET, state);

	renderData(state);

	return render ? undefined : [];
}

export async function clearData(state: State): Promise<void> {
	return clearItems(state, true).then(() => undefined);
}

export async function removeData(
	state: State,
	items: Array<Key | PlainObject>,
	render: false,
): Promise<PlainObject[]>;

export async function removeData(
	state: State,
	items: Array<Key | PlainObject>,
	render: true,
): Promise<void>;

export async function removeData(
	state: State,
	items: Array<Key | PlainObject>,
	render: boolean,
): Promise<unknown> {
	const {key, options} = state;

	const keys = select.reverse(
		items,
		item => (isPlainObject(item) ? getValue(item, key, options.relaxedKeys) : item),
		item => isKey(item) && !isGroupKey(item),
	) as Key[];

	if (keys.length === 0) {
		return render ? undefined : [];
	}

	return removeItems(state, keys, false, false, render as never);
}

async function removeItems(
	state: State,
	data: Key[],
	clear: boolean,
	synchronize: boolean,
	render: false,
): Promise<PlainObject[]>;

async function removeItems(
	state: State,
	data: Key[],
	clear: boolean,
	synchronize: boolean,
	render: true,
): Promise<void>;

async function removeItems(
	state: State,
	keys: Key[],
	clear: boolean,
	synchronize: boolean,
	render: boolean,
): Promise<unknown> {
	const {managers, options} = state;
	const {data, event, group, row} = managers;
	const {store} = data;

	if (clear) {
		return clearItems(state, render);
	}

	const {length} = keys;

	const removedGroups: GroupComponent[] = [];
	const updatedGroups: GroupComponent[] = [];

	const removedData: PlainObject[] = [];
	const removedMap = new Map<Key, PlainObject>();

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const dataIndex = store.keys.all.original.indexOf(key);

		let dataItem: PlainObject | undefined;

		[dataItem] = store.values.array.splice(dataIndex, 1) as PlainObject[];

		removedData.push(dataItem);
		removedMap.set(key, dataItem);

		store.keys.all.original.splice(dataIndex, 1);

		const rowComponent = row.components.get(key);

		if (rowComponent != null) {
			removeRow(state, rowComponent, true);
		}

		store.values.mapped.delete(key);

		if (!group.enabled || isGroupKey(key)) {
			continue;
		}

		managers.group.collapsed.delete(key);

		const groupValue = getValue(dataItem, managers.group.key, options.relaxedKeys) as unknown;

		const groupComponent = getGroup(state, groupValue, 'value');

		if (groupComponent == null || removedGroups.includes(groupComponent)) {
			continue;
		}

		groupComponent.total -= 1;

		if (groupComponent.total > 0) {
			const groupIndex = updatedGroups.indexOf(groupComponent);

			if (groupIndex === -1) {
				updatedGroups.push(groupComponent);
			}

			continue;
		}

		let groupIndex = updatedGroups.indexOf(groupComponent);

		if (groupIndex > -1) {
			updatedGroups.splice(groupIndex, 1);
		}

		groupIndex = store.values.array.indexOf(groupComponent.key.full);

		if (groupIndex > -1) {
			store.keys.all.original.splice(groupIndex, 1);
			store.values.array.splice(groupIndex, 1);
		}

		removedGroups.push(groupComponent);
	}

	removeGroups(state, removedGroups);
	updateGroups(state, updatedGroups);

	void updateFilterCache(DATA_UPDATE_REMOVE, state, removedMap);

	event.herald.emit(EVENT_DATA_REMOVE, removedData);

	if (synchronize) {
		event.herald.emit(EVENT_DATA_SYNCHRONIZE, {
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
