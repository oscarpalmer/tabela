import {
	sort,
	SORT_DIRECTION_ASCENDING,
	SORT_DIRECTION_DESCENDING,
	type ArrayValueSorter,
	type SortDirection,
} from '@oscarpalmer/atoms/array/sort';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {compare} from '@oscarpalmer/atoms/value/compare';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {setAttribute, setAttributes} from '@oscarpalmer/toretto/attribute';
import {findAncestor} from '@oscarpalmer/toretto/find';
import type {DataValue} from '../models/data.model';
import {
	ARIA_SORT,
	ATTRIBUTE_DATA_KEY,
	ATTRIBUTE_DATA_SORT_DIRECTION,
	ATTRIBUTE_DATA_SORT_POSITION,
	SELECTOR_FILTER,
} from '../models/dom.model';
import {
	EVENT_DATA_SORTED,
	EVENT_SORT_ADD,
	EVENT_SORT_CLEAR,
	EVENT_SORT_FLIP,
	EVENT_SORT_REMOVE,
	EVENT_SORT_SET,
} from '../models/event.model';
import {RENDER_ORIGIN_SORT} from '../models/render.model';
import {
	SORT_NONE,
	SORT_OTHER,
	sortDirections,
	type ExtendedArrayValueSorter,
	type TabelaSorter,
} from '../models/sort.model';
import type {State} from '../models/tabela.model';
import {getGroup, isGroupKey} from './group.helper';
import {updateNavigation} from './navigation.helper';
import {render} from './render.helper';
import {updateColumnWidthStyling} from './style.helper';
import {select} from '@oscarpalmer/atoms/array/select';

// #region Functions

function addOrSetSorter(event: KeyboardEvent | MouseEvent, state: State, key: string): void {
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

function compareGroups(this: State, first: unknown, second: unknown): number {
	const {options, managers} = this;

	const firstIsGroup = isGroupKey(first);
	const secondIsGroup = isGroupKey(second);

	const firstValue = firstIsGroup
		? getGroup(this, first)!.value.stringified
		: getValue(first as PlainObject, managers.group.key, options.relaxedKeys);

	const secondValue = secondIsGroup
		? getGroup(this, second)!.value.stringified
		: getValue(second as PlainObject, managers.group.key, options.relaxedKeys);

	const firstOrder = managers.group.order[firstValue as never];
	const secondOrder = managers.group.order[secondValue as never];

	const groupComparison = compare(firstOrder, secondOrder);

	if (groupComparison !== 0) {
		return groupComparison;
	}

	if (firstIsGroup || secondIsGroup) {
		return firstIsGroup && secondIsGroup ? 0 : firstIsGroup ? -1 : 1;
	}

	return 0;
}

export function flipSorter(state: State, key: string, event?: KeyboardEvent | MouseEvent): void {
	const {sort} = state.managers;

	const item = sort.items.find(item => item.field === key);

	if (item == null) {
		return;
	}

	if (event != null && !(event.ctrlKey || event.metaKey)) {
		sort.items = [item];
	}

	item.direction =
		item.direction === SORT_DIRECTION_ASCENDING
			? SORT_DIRECTION_DESCENDING
			: SORT_DIRECTION_ASCENDING;

	state.managers.event.herald.emit(EVENT_SORT_FLIP, [getSorter(item)]);

	sortData(state);
}

function getDirection(direction: unknown): SortDirection {
	return sortDirections.has(direction as never)
		? (direction as SortDirection)
		: SORT_DIRECTION_ASCENDING;
}

function getSortedItems(state: State, sorters: ExtendedArrayValueSorter[]): Key[] {
	const data = (state.managers.data.data.keys.active?.map(key =>
		isGroupKey(key) ? key : state.managers.data.data.values.mapped.get(key)!,
	) ?? state.managers.data.data.values.array) as DataValue[];

	if (!state.managers.group.enabled) {
		return sort(data as PlainObject[], sorters).map(
			item => getValue(item, state.key, state.options.relaxedKeys) as Key,
		);
	}

	return sortDataGrouped(state, data, sorters).map(item =>
		isGroupKey(item)
			? item
			: (getValue(item as PlainObject, state.key, state.options.relaxedKeys) as Key),
	) as Key[];
}

export function getSorter(original: ExtendedArrayValueSorter): TabelaSorter {
	return {
		direction: original.direction!,
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

export function onSort(event: KeyboardEvent | MouseEvent, state: State, target: HTMLElement): void {
	if (findAncestor(event, SELECTOR_FILTER) != null) {
		return;
	}

	const key = target.getAttribute(ATTRIBUTE_DATA_KEY);

	if (key == null) {
		return;
	}

	toggleSorter(event, state, key, target.getAttribute(ATTRIBUTE_DATA_SORT_DIRECTION));

	const {active} = state.managers.navigation;

	active.column = key;
	active.index = -1;
	active.row = 'header';
	active.type = 'header';

	updateColumnWidthStyling(state);
	updateNavigation(state, !(event instanceof KeyboardEvent));
}

export function removeSorter(state: State, key: string, event?: KeyboardEvent | MouseEvent): void {
	const {sort} = state.managers;

	const index = sort.items.findIndex(item => item.field === key);

	if (index === -1) {
		return;
	}

	let spliced: ExtendedArrayValueSorter[];

	if (event != null && !(event.ctrlKey || event.metaKey)) {
		spliced = sort.items.splice(0, sort.items.length);
	} else {
		spliced = sort.items.splice(index, 1);
	}

	state.managers.event.herald.emit(EVENT_SORT_REMOVE, spliced.map(getSorter));

	if (sort.items.length === 0) {
		state.managers.event.herald.emit(EVENT_SORT_CLEAR);
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

export function sortData(state: State): void {
	const {event, sort} = state.managers;
	const {items, size} = sort;

	const {length} = state.managers.column.items;

	for (let index = 0; index < length; index += 1) {
		const column = state.managers.column.items[index];

		const sorterIndex = items.findIndex(item => item.field === column.key.original);
		const sorterItem = items[sorterIndex];

		setAttributes(column.elements.wrapper, {
			[ARIA_SORT]:
				sorterItem == null ? SORT_NONE : items.length > 1 ? SORT_OTHER : sorterItem.direction,
			[ATTRIBUTE_DATA_SORT_DIRECTION]: sorterItem == null ? undefined : sorterItem.direction,
		});

		setAttribute(
			column.elements.sorter,
			ATTRIBUTE_DATA_SORT_POSITION,
			sorterIndex > -1 && items.length > 1 ? sorterIndex + 1 : undefined,
		);
	}

	state.managers.data.data.keys.active =
		size === 0 ? undefined : getSortedItems(state, items.length === 0 ? sort.default! : items);

	event.herald.emit(EVENT_DATA_SORTED, state.managers.data.get(true));

	render(state, RENDER_ORIGIN_SORT);
}

export function sortDataGrouped(
	state: State,
	data: DataValue[],
	sorters: ExtendedArrayValueSorter[],
): DataValue[] {
	return sort(data, [
		compareGroups.bind(state),
		...(sorters as Array<ArrayValueSorter<DataValue>>),
	]);
}

function toggleSorter(
	event: KeyboardEvent | MouseEvent,
	state: State,
	key: string,
	direction?: string | null,
): void {
	switch (direction) {
		case SORT_DIRECTION_ASCENDING:
			flipSorter(state, key, event);
			return;

		case SORT_DIRECTION_DESCENDING:
			removeSorter(state, key, event);
			return;

		default:
			addOrSetSorter(event, state, key);
			return;
	}
}

// #endregion
