import {select} from '@oscarpalmer/atoms/array/select';
import {sort, SORT_DIRECTION_ASCENDING, type SortDirection} from '@oscarpalmer/atoms/array/sort';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import type {DataValue} from '../../models/data.model';
import {
	EVENT_SORT_ADD,
	EVENT_SORT_CLEAR,
	EVENT_SORT_REMOVE,
	EVENT_SORT_SET,
} from '../../models/event.model';
import {
	type ExtendedArrayValueSorter,
	sortDirections,
	type TabelaSorter,
} from '../../models/sort.model';
import type {State} from '../../models/tabela.model';
import {isGroupKey} from '../group/group.misc';
import {sortData, sortGroupedData} from './sort.event';

// #region Functions

export function addOrSetSorter(event: KeyboardEvent | MouseEvent, state: State, key: string): void {
	if (event.ctrlKey || event.metaKey) {
		addSorter(state, key);
	} else {
		setSorters(
			state,
			[
				{
					key,
					direction: SORT_DIRECTION_ASCENDING,
				},
			],
			false,
		);
	}
}

export function addSorter(state: State, key: string, direction?: SortDirection): void {
	const {event, sort} = state.managers;

	const index = sort.items.findIndex(item => item.field === key);

	if (index > -1) {
		return;
	}

	const sorter = getValidSorter(state, {
		direction,
		key,
	});

	if (sorter == null) {
		return;
	}

	sort.items.push(sorter);

	event.herald.emit(EVENT_SORT_ADD, [getSorter(sorter)]);

	sortData(state);
}

export function clearSorters(state: State): void {
	const {event, sort} = state.managers;

	if (sort.items.length === 0) {
		return;
	}

	sort.items.length = 0;

	event.herald.emit(EVENT_SORT_CLEAR);

	sortData(state);
}

export function getDirection(direction: unknown): SortDirection {
	return sortDirections.has(direction as never)
		? (direction as SortDirection)
		: SORT_DIRECTION_ASCENDING;
}

export function getSortedItems(state: State, sorters: ExtendedArrayValueSorter[]): Key[] {
	const {key, managers, options} = state;
	const {data, group} = managers;

	const items = (data.store.keys.all.active?.map(key =>
		isGroupKey(key) ? key : data.store.values.mapped.get(key)!,
	) ?? data.store.values.array) as DataValue[];

	if (!group.enabled) {
		return sort(items as PlainObject[], sorters).map(
			item => getValue(item, key, options.relaxedKeys) as Key,
		);
	}

	return sortGroupedData(state, items, sorters).map(item =>
		isGroupKey(item) ? item : (getValue(item as PlainObject, key, options.relaxedKeys) as Key),
	) as Key[];
}

export function getSorter(original: ExtendedArrayValueSorter): TabelaSorter {
	return {
		direction: original.direction ?? SORT_DIRECTION_ASCENDING,
		key: original.field,
	};
}

export function getValidSorter(state: State, value: unknown): ExtendedArrayValueSorter | undefined {
	if (typeof value === 'string') {
		return {
			direction: SORT_DIRECTION_ASCENDING,
			field: value,
			value: item => getValue(item as PlainObject, value as string, state.options.relaxedKeys),
		};
	}

	if (isSorter(value)) {
		return {
			direction: getDirection((value as TabelaSorter).direction),
			field: (value as TabelaSorter).key,
			value:
				(value as TabelaSorter).value ??
				(item =>
					getValue(item as PlainObject, (value as TabelaSorter).key, state.options.relaxedKeys)),
		};
	}

	return undefined;
}

export function isSorter(value: unknown): value is TabelaSorter {
	return (
		isPlainObject(value) &&
		typeof (value as TabelaSorter).key === 'string' &&
		('value' in (value as TabelaSorter)
			? typeof (value as TabelaSorter).value === 'function'
			: true)
	);
}

export function removeSorter(state: State, key: string, origin?: KeyboardEvent | MouseEvent): void {
	const {event, sort} = state.managers;

	const index = sort.items.findIndex(item => item.field === key);

	if (index === -1) {
		return;
	}

	let spliced: ExtendedArrayValueSorter[];

	if (origin != null && !(origin.ctrlKey || origin.metaKey)) {
		spliced = sort.items.splice(0, sort.items.length);
	} else {
		spliced = sort.items.splice(index, 1);
	}

	event.herald.emit(EVENT_SORT_REMOVE, spliced.map(getSorter));

	if (sort.items.length === 0) {
		event.herald.emit(EVENT_SORT_CLEAR);
	}

	sortData(state);
}

export function setSorters(state: State, items: TabelaSorter[], set: boolean): void {
	const {event, sort} = state.managers;

	const sorters = select.reverse(
		items,
		item => getValidSorter(state, item),
		item => item != null,
	) as ExtendedArrayValueSorter[];

	const removed = sort.items.splice(0, sort.items.length, ...sorters);

	if (set) {
		event.herald.emit(EVENT_SORT_SET, {
			added: sorters.map(getSorter),
			removed: removed.map(getSorter),
		});
	} else {
		event.herald.emit(EVENT_SORT_ADD, sorters.map(getSorter));
	}

	sortData(state);
}

// #endregion
