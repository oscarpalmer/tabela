import {isKey, isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {createGroup} from '../../components/group.component';
import type {ColumnComponent} from '../../models/column.model';
import {DATA_UPDATE_ADD} from '../../models/data.model';
import {EVENT_DATA_ADD} from '../../models/event.model';
import type {GroupComponent} from '../../models/group.model';
import type {State} from '../../models/tabela.model';
import {getColumn} from '../column/column.item';
import {updateFilterCache} from '../filter/filter.cache';
import {updateGroups} from '../group/group.dom';
import {addGroups, getGroup} from '../group/group.item';
import {renderData} from './data.render';
import {updateData} from './data.update';

// #region Functions

export async function addData(state: State, items: PlainObject[], render: boolean): Promise<void> {
	if (!Array.isArray(items)) {
		return;
	}

	const {length} = items;

	if (length === 0) {
		return;
	}

	const {key, managers, options} = state;
	const {data, event, group} = managers;
	const {store} = data;

	const addedItems: PlainObject[] = [];
	const updatedItems: PlainObject[] = [];

	const addedGroups: GroupComponent[] = [];
	const updatedGroups: GroupComponent[] = [];

	const addedMap = new Map<Key, PlainObject>();

	let groupColumn: ColumnComponent | undefined;

	for (let index = 0; index < length; index += 1) {
		const item = items[index];

		if (!isPlainObject(item)) {
			continue;
		}

		const itemKey = getValue(item, key, options.relaxedKeys);

		if (!isKey(itemKey)) {
			continue;
		}

		if (store.values.mapped.has(itemKey)) {
			updatedItems.push(item);

			continue;
		}

		addedItems.push(item);
		addedMap.set(itemKey, item);

		store.values.array.push(item);
		store.values.mapped.set(itemKey, item);

		if (!group.enabled) {
			continue;
		}

		const groupValue = getValue(item, group.key, options.relaxedKeys);

		let groupComponent =
			getGroup(state, groupValue, 'value') ??
			addedGroups.find(added => added.value.original === groupValue);

		if (groupComponent == null) {
			groupColumn ??= getColumn(state, group.key);

			groupComponent = createGroup(
				`${groupColumn?.options.label ?? group.key}: ${getString(groupValue)}`,
				groupValue,
			);

			store.values.array.push(groupComponent.key.full);

			addedGroups.push(groupComponent);
		} else if (!addedGroups.includes(groupComponent) && !updatedGroups.includes(groupComponent)) {
			updatedGroups.push(groupComponent);
		}

		if (!groupComponent.expanded) {
			group.collapsed.add(itemKey);
		}

		groupComponent.total += 1;
	}

	addGroups(state, addedGroups);
	updateGroups(state, updatedGroups);

	const noAddedData = addedItems.length === 0;

	if (!noAddedData) {
		await updateFilterCache(DATA_UPDATE_ADD, state, addedMap);
	}

	await updateData(state, updatedItems, noAddedData);

	if (noAddedData) {
		return;
	}

	event.herald.emit(EVENT_DATA_ADD, addedItems);

	if (render) {
		renderData(state);
	}
}

// #endregion
