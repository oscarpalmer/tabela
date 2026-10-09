import {isKey, isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {createGroup} from '../../components/group.component';
import type {ColumnComponent} from '../../models/column.model';
import {EVENT_DATA_ADD} from '../../models/event.model';
import type {GroupComponent} from '../../models/group.model';
import type {State} from '../../models/tabela.model';
import {getColumn} from '../column.helper';
import {addGroups, getGroup, updateGroups} from '../group.helper';
import {renderData} from './data.render';
import {updateData} from './data.update';

// #region Functions

export async function addData(state: State, data: PlainObject[], render: boolean): Promise<void> {
	if (!Array.isArray(data) || data.length === 0) {
		return;
	}

	const addedData: PlainObject[] = [];
	const updatedData: PlainObject[] = [];

	const addedGroups: GroupComponent[] = [];
	const updatedGroups: GroupComponent[] = [];

	let groupColumn: ColumnComponent | undefined;
	let {length} = data;

	for (let index = 0; index < length; index += 1) {
		const item = data[index];

		if (!isPlainObject(item)) {
			continue;
		}

		const key = getValue(item, state.key);

		if (!isKey(key)) {
			continue;
		}

		if (state.managers.data.data.values.mapped.has(key)) {
			updatedData.push(item);

			continue;
		}

		addedData.push(item);

		state.managers.data.data.values.array.push(item);
		state.managers.data.data.values.mapped.set(key, item);

		if (!state.managers.group.enabled) {
			continue;
		}

		const groupValue = getValue(item, state.managers.group.key);

		let group =
			getGroup(state, groupValue, true) ??
			addedGroups.find(added => added.value.original === groupValue);

		if (group == null) {
			groupColumn ??= getColumn(state, state.managers.group.key);

			group = createGroup(
				`${groupColumn?.options.label ?? state.managers.group.key}: ${String(groupValue)}`,
				groupValue,
			);

			state.managers.data.data.values.array.push(group.key.full);

			addedGroups.push(group);
		} else if (!addedGroups.includes(group) && !updatedGroups.includes(group)) {
			updatedGroups.push(group);
		}

		if (!group.expanded) {
			state.managers.group.collapsed.add(key);
		}

		group.total += 1;
	}

	addGroups(state, addedGroups);
	updateGroups(state, updatedGroups);

	await updateData(state, updatedData, addedData.length === 0);

	if (addedData.length === 0) {
		return;
	}

	state.managers.event.herald.emit(EVENT_DATA_ADD, addedData);

	if (render) {
		renderData(state);
	}
}

// #endregion
