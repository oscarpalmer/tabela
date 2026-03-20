import {isKey, isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import type {ColumnComponent} from '../../components/column.component';
import {GroupComponent} from '../../components/group.component';
import type {DataState} from '../../models/data.model';
import {EVENT_DATA_ADD} from '../../models/event.model';
import {renderData} from './data.render';
import {updateData} from './data.update';

export async function addData(
	state: DataState,
	data: PlainObject[],
	render: boolean,
): Promise<void> {
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

		if (state.values.mapped.has(key)) {
			updatedData.push(item);

			continue;
		}

		addedData.push(item);

		state.values.array.push(item);
		state.values.mapped.set(key, item);

		if (!state.managers.group.enabled) {
			continue;
		}

		const groupValue = getValue(item, state.managers.group.key);

		let group =
			state.managers.group.getForValue(groupValue) ??
			addedGroups.find(added => added.value.original === groupValue);

		if (group == null) {
			groupColumn ??= state.managers.column.get(state.managers.group.key);

			group = new GroupComponent(
				`${groupColumn?.options.label ?? state.managers.group.key}: ${String(groupValue)}`,
				groupValue,
			);

			state.values.array.push(group.key);

			addedGroups.push(group);
		} else if (!addedGroups.includes(group) && !updatedGroups.includes(group)) {
			updatedGroups.push(group);
		}

		if (!group.expanded) {
			state.managers.group.collapsed.add(key);
		}

		group.total += 1;
	}

	state.managers.group.add(addedGroups);
	state.managers.group.update(updatedGroups);

	await updateData(state, updatedData, addedData.length === 0);

	if (addedData.length === 0) {
		return;
	}

	state.managers.event.emit(EVENT_DATA_ADD, addedData);

	if (render) {
		renderData(state);
	}
}
