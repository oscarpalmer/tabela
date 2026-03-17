import {sort} from '@oscarpalmer/atoms/array';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {compare} from '@oscarpalmer/atoms/value/compare';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {setAttribute, setAttributes} from '@oscarpalmer/toretto/attribute';
import {isGroupKey} from '../helpers/misc.helpers';
import type {DataValue} from '../models/data.model';
import {
	ARIA_SORT,
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
import {
	SORT_ASCENDING,
	SORT_DESCENDING,
	type TabelaSort,
	type TabelaSortDirection,
	type TabelaSortItem,
} from '../models/sort.model';
import type {State} from '../models/tabela.model';

export class SortManager {
	handlers: TabelaSort = {
		add: (field, direction) => this.add(field, direction),
		flip: field => this.flip(field),
		clear: () => this.clear(),
		remove: field => this.remove(field),
		set: items => this.set(items, true),
	};

	items: TabelaSortItem[] = [];

	constructor(public state: State) {}

	add(key: string, direction?: TabelaSortDirection): void {
		const index = this.items.findIndex(item => item.key === key);

		if (index > -1) {
			return;
		}

		this.items.push({
			key,
			direction: direction ?? SORT_ASCENDING,
		});

		this.state.managers.event.emit(EVENT_SORT_ADD, [{key, direction: direction ?? SORT_ASCENDING}]);

		this.sort();
	}

	addOrSet(event: MouseEvent, key: string): void {
		if (event.ctrlKey || event.metaKey) {
			this.add(key);
		} else {
			this.set([{key, direction: SORT_ASCENDING}], false);
		}
	}

	clear(): void {
		if (this.items.length === 0) {
			return;
		}

		this.items.length = 0;

		this.state.managers.event.emit(EVENT_SORT_CLEAR);

		this.sort();
	}

	destroy(): void {
		this.handlers = undefined as never;
		this.items = undefined as never;
		this.state = undefined as never;
	}

	flip(key: string): void {
		const item = this.items.find(item => item.key === key);

		if (item == null) {
			return;
		}

		item.direction = item.direction === SORT_ASCENDING ? SORT_DESCENDING : SORT_ASCENDING;

		this.state.managers.event.emit(EVENT_SORT_FLIP, [{key, direction: item.direction}]);

		this.sort();
	}

	remove(key: string): void {
		const index = this.items.findIndex(item => item.key === key);

		if (index === -1) {
			return;
		}

		const spliced = this.items.splice(index, 1);

		this.state.managers.event.emit(EVENT_SORT_REMOVE, spliced);

		if (this.items.length === 0) {
			this.state.managers.event.emit(EVENT_SORT_CLEAR);
		}

		this.sort();
	}

	set(items: TabelaSortItem[], set: boolean): void {
		const removed = this.items.splice(
			0,
			this.items.length,
			...items.map(item => ({key: item.key, direction: item.direction})),
		);

		if (set) {
			this.state.managers.event.emit(EVENT_SORT_SET, {
				removed,
				added: items.map(item => ({key: item.key, direction: item.direction})),
			});
		} else {
			this.state.managers.event.emit(
				EVENT_SORT_ADD,
				items.map(item => ({key: item.key, direction: item.direction})),
			);
		}

		this.sort();
	}

	sort(): void {
		const {items, state} = this;

		const {length} = state.managers.column.items;

		for (let index = 0; index < length; index += 1) {
			const column = state.managers.column.items[index];

			const sorterIndex = items.findIndex(item => item.key === column.options.key);
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
			items.length === 0 ? undefined : getSortedItems(state, items);

		state.managers.event.emit(EVENT_DATA_SORTED, state.managers.data.get(true));

		state.managers.render.update(true, true);
	}

	toggle(event: MouseEvent, key: string, direction?: string | null): void {
		switch (direction) {
			case SORT_ASCENDING:
				this.flip(key);
				return;

			case SORT_DESCENDING:
				this.remove(key);
				return;

			default:
				this.addOrSet(event, key);
				return;
		}
	}
}

function getSortedItems(state: State, sorters: TabelaSortItem[]): Key[] {
	const data = (state.managers.data.state.keys.active?.map(key =>
		isGroupKey(key) ? key : state.managers.data.state.values.mapped.get(key)!,
	) ?? state.managers.data.state.values.array) as DataValue[];

	if (!state.managers.group.enabled) {
		return sort(data as PlainObject[], sorters as never).map(
			item => getValue(item, state.key) as Key,
		);
	}

	return sortWithGroups(state, data, sorters).map(item =>
		isGroupKey(item) ? item : (getValue(item as PlainObject, state.key) as Key),
	) as Key[];
}

export function sortWithGroups(
	state: State,
	data: DataValue[],
	sorters: TabelaSortItem[],
): DataValue[] {
	const {length} = sorters;

	return data.sort((first, second) => {
		const firstIsGroup = isGroupKey(first);
		const secondIsGroup = isGroupKey(second);

		const firstValue = firstIsGroup
			? state.managers.group.getForKey(first as string)!.value.stringified
			: getValue(first as PlainObject, state.managers.group.key);

		const secondValue = secondIsGroup
			? state.managers.group.getForKey(second as string)!.value.stringified
			: getValue(second as PlainObject, state.managers.group.key);

		const firstOrder = state.managers.group.order[firstValue as never];
		const secondOrder = state.managers.group.order[secondValue as never];

		const groupComparison = compare(firstOrder, secondOrder);

		if (groupComparison !== 0) {
			return groupComparison;
		}

		if (firstIsGroup || secondIsGroup) {
			return firstIsGroup && secondIsGroup ? 0 : firstIsGroup ? -1 : 1;
		}

		for (let index = 0; index < length; index += 1) {
			const sorter = sorters[index];

			const comparison = compare(
				getValue(first as PlainObject, sorter.key),
				getValue(second as PlainObject, sorter.key),
			);

			if (comparison !== 0) {
				return comparison * (sorter.direction === SORT_ASCENDING ? 1 : -1);
			}
		}

		return 0;
	});
}

const SORT_NONE = 'none';

const SORT_OTHER = 'other';
