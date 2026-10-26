import {filter} from '@oscarpalmer/atoms/array/filter';
import {select} from '@oscarpalmer/atoms/array/select';
import {toRecord} from '@oscarpalmer/atoms/array/to-record';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {createGroup} from '../../components/group.component';
import type {DataValue} from '../../models/data.model';
import type {GroupComponent} from '../../models/group.model';
import type {State} from '../../models/tabela.model';
import {getColumn} from '../column/column.item';
import {setGroups} from '../group/group.item';
import {isGroupKey} from '../group/group.misc';
import {renderData} from './data.render';

// #region Functions

export function getData(state: State, active?: boolean): PlainObject[] {
	const {store} = state.managers.data;

	return (active ?? false) && store.keys.all.active != null
		? select(
				store.keys.all.active,
				key => !isGroupKey(key),
				key => store.values.mapped.get(key as Key)!,
			)
		: (filter.remove(store.values.array, isGroupKey) as PlainObject[]);
}

export function getKeyIndex(state: State, item?: Key): number {
	return item == null ? -1 : state.managers.data.keys.indexOf(item);
}

export function getRowIndex(state: State, item?: Key): number {
	return item == null ? -1 : state.managers.data.rows.indexOf(item);
}

export async function setData(state: State, items: PlainObject[]): Promise<void> {
	const {managers} = state;
	const {data, group} = managers;

	const values: DataValue[] = items.slice();

	if (!group.enabled) {
		data.store.values.array = values;

		return renderData(state);
	}

	const column = getColumn(state, group.key);

	const grouped = toRecord.arrays(items, group.key) as Record<string, PlainObject[]>;

	const entries = Object.entries(grouped);
	const {length} = entries;

	const groups: GroupComponent[] = [];

	for (let index = 0; index < length; index += 1) {
		const [value, items] = entries[index];

		const prefix = typeof column?.options.label === 'string' ? column.options.label : group.key;

		const groupComponent = createGroup(`${prefix}: ${value}`, value);

		groupComponent.total = items.length;

		groups.push(groupComponent);

		values.push(groupComponent.key.full);
	}

	setGroups(state, groups);

	data.store.values.array = values;

	renderData(state);
}

// #endregion
