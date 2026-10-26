import {filter} from '@oscarpalmer/atoms/array/filter';
import {select} from '@oscarpalmer/atoms/array/select';
import {toRecord} from '@oscarpalmer/atoms/array/to-record';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {createGroup} from '../../components/group.component';
import type {DataValue} from '../../models/data.model';
import type {GroupComponent} from '../../models/group.model';
import type {State} from '../../models/tabela.model';
import {getColumn} from '../column.helper';
import {isGroupKey, setGroups} from '../group.helper';
import {renderData} from './data.render';

// #region Functions

export function getData(state: State, active?: boolean): PlainObject[] {
	const {data} = state.managers.data;

	return (active ?? false) && data.keys.all.active != null
		? select(
				data.keys.all.active,
				key => !isGroupKey(key),
				key => data.values.mapped.get(key as Key)!,
			)
		: (filter.remove(data.values.array, isGroupKey) as PlainObject[]);
}

export function getKeyIndex(state: State, item?: Key): number {
	return item == null ? -1 : state.managers.data.keys.indexOf(item);
}

export function getRowIndex(state: State, item?: Key): number {
	return item == null ? -1 : state.managers.data.rows.indexOf(item);
}

export async function setData(state: State, data: PlainObject[]): Promise<void> {
	const array: DataValue[] = data.slice();

	if (state.managers.group.enabled) {
		const column = getColumn(state, state.managers.group.key);

		const grouped = toRecord.arrays(data, state.managers.group.key) as Record<
			string,
			PlainObject[]
		>;

		const entries = Object.entries(grouped);
		const {length} = entries;

		const groups: GroupComponent[] = [];

		for (let index = 0; index < length; index += 1) {
			const [value, items] = entries[index];

			const group = createGroup(
				`${column?.options.label ?? state.managers.group.key}: ${value}`,
				value,
			);

			group.total = items.length;

			groups.push(group);

			array.push(group.key.full);
		}

		setGroups(state, groups);
	}

	state.managers.data.data.values.array = array;

	renderData(state);
}

// #endregion
