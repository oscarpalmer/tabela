import {sort} from '@oscarpalmer/atoms/array';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {compare} from '@oscarpalmer/atoms/value/compare';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {setAttribute, setAttributes} from '@oscarpalmer/toretto/attribute';
import {
	ARIA_SORT,
	ATTRIBUTE_DATA_SORT_DIRECTION,
	ATTRIBUTE_DATA_SORT_POSITION,
} from '../models/dom.model';
import {
	SORT_ASCENDING,
	SORT_DESCENDING,
	type TabelaSort,
	type TabelaSortDirection,
	type TabelaSortItem,
} from '../models/sort.model';
import type {State} from '../models/tabela.model';
import type {DataValue} from '../models/data.model';
import {isGroupKey} from '../helpers/misc.helpers';

export class SortManager {
	handlers: TabelaSort = {
		add: (field, direction) => this.add(field, direction),
		flip: field => this.flip(field),
		clear: () => this.clear(),
		remove: field => this.remove(field),
		set: items => this.set(items),
	};

	items: PlainObject[] = [];

	constructor(public state: State) {}

	add(field: string, direction?: TabelaSortDirection): void {
		const index = this.items.findIndex(item => item.key === field);

		if (index > -1) {
			return;
		}

		this.items.push({
			key: field,
			direction: direction ?? SORT_ASCENDING,
		});

		this.sort();
	}

	addOrSet(event: MouseEvent, field: string): void {
		if (event.ctrlKey || event.metaKey) {
			this.add(field);
		} else {
			this.set([{field, direction: SORT_ASCENDING}]);
		}
	}

	clear(): void {
		if (this.items.length > 0) {
			this.items.length = 0;

			this.sort();
		}
	}

	destroy(): void {
		this.handlers = undefined as never;
		this.items = undefined as never;
		this.state = undefined as never;
	}

	flip(field: string): void {
		const item = this.items.find(item => item.key === field);

		if (item == null) {
			return;
		}

		item.direction = item.direction === SORT_ASCENDING ? SORT_DESCENDING : SORT_ASCENDING;

		this.sort();
	}

	remove(field: string): void {
		const index = this.items.findIndex(item => item.key === field);

		if (index > -1) {
			this.items.splice(index, 1);

			this.sort();
		}
	}

	removeOrClear(event: MouseEvent, field: string): void {
		if (event.ctrlKey || event.metaKey) {
			this.remove(field);
		} else {
			this.clear();
		}
	}

	set(items: TabelaSortItem[]): void {
		this.items.splice(
			0,
			this.items.length,
			...items.map(item => ({key: item.field, direction: item.direction})),
		);

		this.sort();
	}

	sort(): void {
		const {items, state} = this;

		const {length} = state.managers.column.items;

		for (let index = 0; index < length; index += 1) {
			const column = state.managers.column.items[index];

			const sorterIndex = items.findIndex(item => item.key === column.options.field);
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

		state.managers.render.update(true, true);
	}

	toggle(event: MouseEvent, field: string, direction?: string | null): void {
		switch (direction) {
			case SORT_ASCENDING:
				this.flip(field);
				return;

			case SORT_DESCENDING:
				this.removeOrClear(event, field);
				return;

			default:
				this.addOrSet(event, field);
				return;
		}
	}
}

function getSortedItems(state: State, sorters: PlainObject[]): Key[] {
	const data =
		(state.managers.data.state.keys.active?.map(key =>
			isGroupKey(key) ? key : state.managers.data.state.values.mapped.get(key)!,
		) as DataValue[]) ?? state.managers.data.state.values.array;

	if (!state.managers.group.enabled) {
		return sort(data as PlainObject[], sorters as never).map(
			item => getValue(item, state.key) as Key,
		);
	}

	return sortWithGroups(state, data, sorters).map(item =>
		typeof item === 'string' ? item : (getValue(item, state.key) as Key),
	);
}

export function sortWithGroups(
	state: State,
	data: DataValue[],
	sorters: PlainObject[],
): DataValue[] {
	const {length} = sorters;

	return data.sort((first, second) => {
		const firstIsGroup = typeof first === 'string';
		const secondIsGroup = typeof second === 'string';

		const firstValue = firstIsGroup
			? state.managers.group.getForKey(first)?.value.stringified
			: getValue(first, state.managers.group.field);

		const secondValue = secondIsGroup
			? state.managers.group.getForKey(second)?.value.stringified
			: getValue(second, state.managers.group.field);

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
				getValue(first, (sorter as any).key),
				getValue(second, (sorter as any).key),
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
