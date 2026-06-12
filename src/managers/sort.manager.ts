import {
	type ArrayValueSorter,
	type SortDirection,
	sort,
	SORT_DIRECTION_ASCENDING,
	SORT_DIRECTION_DESCENDING,
} from '@oscarpalmer/atoms/array/sort';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {compare} from '@oscarpalmer/atoms/value/compare';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {setAttribute, setAttributes} from '@oscarpalmer/toretto/attribute';
import {getSorter, getValidSorter, isGroupKey} from '../helpers/misc.helpers';
import type {DataValue} from '../models/data.model';
import {
	ARIA_SORT,
	ATTRIBUTE_DATA_KEY,
	ATTRIBUTE_DATA_SORT_DIRECTION,
	ATTRIBUTE_DATA_SORT_POSITION,
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
	type ExtendedArrayValueSorter,
	type TabelaSort,
	type TabelaSorter,
} from '../models/sort.model';
import type {State} from '../models/tabela.model';
import {getGroup} from './group.manager';
import {updateNavigation} from './navigation.manager';
import {render} from './render.manager';

// #region Types

export class SortManager {
	default: ExtendedArrayValueSorter[];

	handlers: TabelaSort = {
		add: (key, direction) => addSorter(this.state, key, direction),
		flip: key => flipSorter(this.state, key),
		clear: () => clearSorters(this.state),
		remove: key => removeSorter(this.state, key),
		set: items => setSorters(this.state, items, true),
	};

	items: ExtendedArrayValueSorter[] = [];

	get size(): number {
		return this.items.length === 0 ? (this.default == null ? 0 : 1) : this.items.length;
	}

	constructor(public state: State) {
		this.default = [getValidSorter(state.options.sorting ?? state.key)!];
	}

	destroy(): void {
		this.handlers = undefined as never;
		this.items = undefined as never;
		this.state = undefined as never;
	}
}

// #endregion

// #region Functions

function addSorter(state: State, key: string, direction?: SortDirection): void {
	const {event, sort} = state.managers;

	const index = sort.items.findIndex(item => item.field === key);

	if (index > -1) {
		return;
	}

	const sorter = getValidSorter({
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

function clearSorters(state: State): void {
	const {event, sort} = state.managers;

	if (sort.items.length === 0) {
		return;
	}

	sort.items.length = 0;

	event.herald.emit(EVENT_SORT_CLEAR);

	sortData(state);
}

function compareGroups(this: State, first: unknown, second: unknown): number {
	const {managers} = this;

	const firstIsGroup = isGroupKey(first);
	const secondIsGroup = isGroupKey(second);

	const firstValue = firstIsGroup
		? getGroup(this, first)!.value.stringified
		: getValue(first as PlainObject, managers.group.key);

	const secondValue = secondIsGroup
		? getGroup(this, second)!.value.stringified
		: getValue(second as PlainObject, managers.group.key);

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

function flipSorter(state: State, key: string): void {
	const {event, sort} = state.managers;

	const item = sort.items.find(item => item.field === key);

	if (item == null) {
		return;
	}

	item.direction =
		item.direction === SORT_DIRECTION_ASCENDING
			? SORT_DIRECTION_DESCENDING
			: SORT_DIRECTION_ASCENDING;

	event.herald.emit(EVENT_SORT_FLIP, [getSorter(item)]);

	sortData(state);
}

function getSortedItems(state: State, sorters: ExtendedArrayValueSorter[]): Key[] {
	const data = (state.managers.data.state.keys.active?.map(key =>
		isGroupKey(key) ? key : state.managers.data.state.values.mapped.get(key)!,
	) ?? state.managers.data.state.values.array) as DataValue[];

	if (!state.managers.group.enabled) {
		return sort(data as PlainObject[], sorters).map(
			item => getValue(item, state.key) as Key,
		);
	}

	return sortDataGrouped(state, data, sorters).map(item =>
		isGroupKey(item) ? item : (getValue(item as PlainObject, state.key) as Key),
	) as Key[];
}

export function onSort(event: KeyboardEvent | MouseEvent, state: State, target: HTMLElement): void {
	const direction = target.getAttribute(ATTRIBUTE_DATA_SORT_DIRECTION);
	const key = target.getAttribute(ATTRIBUTE_DATA_KEY);

	if (key == null) {
		return;
	}

	toggleSorter(event, state, key, direction);

	const {active} = state.managers.navigation;

	active.column = key;
	active.index = -1;
	active.row = 'header';
	active.type = 'header';

	updateNavigation(state, !(event instanceof KeyboardEvent));
}

function removeSorter(state: State, key: string): void {
	const {event, sort} = state.managers;

	const index = sort.items.findIndex(item => item.field === key);

	if (index === -1) {
		return;
	}

	const spliced = sort.items.splice(index, 1);

	event.herald.emit(EVENT_SORT_REMOVE, spliced.map(getSorter));

	if (sort.items.length === 0) {
		event.herald.emit(EVENT_SORT_CLEAR);
	}

	sortData(state);
}

function setSorters(state: State, items: TabelaSorter[], set: boolean): void {
	const {event, sort} = state.managers;

	const sorters = items.map(getValidSorter).filter(sorter => sorter != null);

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

		const sorterIndex = items.findIndex(item => item.field === column.options.key);
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

	state.managers.data.state.keys.active =
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
			flipSorter(state, key);
			return;

		case SORT_DIRECTION_DESCENDING:
			removeSorter(state, key);
			return;

		default:
			addOrSetSorter(event, state, key);
			return;
	}
}

// #endregion

// #region Variables

const SORT_NONE = 'none';

const SORT_OTHER = 'other';

// #endregion
