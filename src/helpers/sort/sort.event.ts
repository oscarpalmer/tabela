import {filter} from '@oscarpalmer/atoms/array/filter';
import {
	sort,
	SORT_DIRECTION_ASCENDING,
	SORT_DIRECTION_DESCENDING,
	type ArrayValueSorter,
} from '@oscarpalmer/atoms/array/sort';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {compare} from '@oscarpalmer/atoms/value/compare';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {setAttribute, setAttributes} from '@oscarpalmer/toretto/attribute';
import {findAncestor} from '@oscarpalmer/toretto/find';
import type {DataValue} from '../../models/data.model';
import {
	ARIA_SORT,
	ATTRIBUTE_DATA_KEY,
	ATTRIBUTE_DATA_SORT_DIRECTION,
	ATTRIBUTE_DATA_SORT_POSITION,
	SELECTOR_FILTER,
} from '../../models/dom.model';
import {EVENT_DATA_SORTED, EVENT_SORT_FLIP} from '../../models/event.model';
import {RENDER_ORIGIN_SORT} from '../../models/render.model';
import {SORT_NONE, SORT_OTHER, type ExtendedArrayValueSorter} from '../../models/sort.model';
import type {State} from '../../models/tabela.model';
import {getData} from '../data/data.misc';
import {getGroup} from '../group/group.item';
import {isGroupKey} from '../group/group.misc';
import {updateNavigation} from '../navigation/navigation.misc';
import {renderOrigin} from '../render/render.work';
import {updateColumnWidthStyling} from '../style.helper';
import {addOrSetSorter, getSortedItems, getSorter, removeSorter} from './sort.item';

// #region Functions

function compareGroups(this: State, first: unknown, second: unknown): number {
	const {options, managers} = this;
	const {group} = managers;

	const firstIsGroup = isGroupKey(first);
	const secondIsGroup = isGroupKey(second);

	const firstValue = firstIsGroup
		? getGroup(this, first)?.value.stringified
		: getValue(first as PlainObject, group.key, options.relaxedKeys);

	const secondValue = secondIsGroup
		? getGroup(this, second)?.value.stringified
		: getValue(second as PlainObject, group.key, options.relaxedKeys);

	const firstOrder = group.order[firstValue as never];
	const secondOrder = group.order[secondValue as never];

	const groupComparison = compare(firstOrder, secondOrder);

	if (groupComparison !== 0) {
		return groupComparison;
	}

	if (firstIsGroup || secondIsGroup) {
		if (firstIsGroup && secondIsGroup) {
			return 0;
		}

		return firstIsGroup ? -1 : 1;
	}

	return 0;
}

export function flipSorter(state: State, key: string, origin?: KeyboardEvent | MouseEvent): void {
	const {event, sort} = state.managers;

	const item = sort.items.find(item => item.field === key);

	if (item == null) {
		return;
	}

	if (origin != null && !(origin.ctrlKey || origin.metaKey)) {
		sort.items = [item];
	}

	item.direction =
		item.direction === SORT_DIRECTION_ASCENDING
			? SORT_DIRECTION_DESCENDING
			: SORT_DIRECTION_ASCENDING;

	event.herald.emit(EVENT_SORT_FLIP, [getSorter(item)]);

	sortData(state);
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

export function sortData(state: State): void {
	const {data, event, sort} = state.managers;
	const {items, size} = sort;

	const {length} = state.managers.column.items;

	for (let index = 0; index < length; index += 1) {
		const column = state.managers.column.items[index];

		const sorterIndex = items.findIndex(item => item.field === column.key.original);
		const sorterItem = items[sorterIndex];

		let ariaSort: string | undefined;

		if (sorterItem == null) {
			ariaSort = SORT_NONE;
		} else {
			ariaSort = items.length > 1 ? SORT_OTHER : sorterItem.direction;
		}

		setAttributes(column.elements.wrapper, {
			[ARIA_SORT]: ariaSort,
			[ATTRIBUTE_DATA_SORT_DIRECTION]: sorterItem == null ? undefined : sorterItem.direction,
		});

		setAttribute(
			column.elements.sorter,
			ATTRIBUTE_DATA_SORT_POSITION,
			sorterIndex > -1 && items.length > 1 ? sorterIndex + 1 : undefined,
		);
	}

	const sorters = items.length === 0 ? sort.default : items;

	const active = size === 0 ? undefined : getSortedItems(state, sorters);

	data.store.keys.all.active = active;
	data.store.keys.row.active = active == null ? undefined : filter.remove(active, isGroupKey);

	event.herald.emit(EVENT_DATA_SORTED, getData(state, true));

	renderOrigin(state, RENDER_ORIGIN_SORT);
}

export function sortGroupedData(
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
