import {sort, type ArrayKeySorter} from '@oscarpalmer/atoms/array';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {compare} from '@oscarpalmer/atoms/value/compare';
import {setAttribute, setAttributes} from '@oscarpalmer/toretto/attribute';
import {GroupComponent} from '../components/group.component';
import type {TabelaSort, TabelaSortDirection, TabelaSortItem} from '../models/sort.model';
import type {State} from '../models/tabela.model';

export class SortManager {
	handlers = Object.freeze({
		add: (field, direction) => this.add(field, direction),
		flip: field => this.flip(field),
		clear: () => this.clear(),
		remove: field => this.remove(field),
		set: items => this.set(items),
	} satisfies TabelaSort);

	items: ArrayKeySorter<PlainObject>[] = [];

	constructor(public state: State) {}

	add(field: string, direction?: TabelaSortDirection): void {
		const index = this.items.findIndex(item => item.key === field);

		if (index > -1) {
			return;
		}

		this.items.push({
			key: field,
			direction: direction ?? 'ascending',
		});

		this.sort();
	}

	addOrSet(event: MouseEvent, field: string): void {
		if (event.ctrlKey || event.metaKey) {
			this.add(field);
		} else {
			this.set([{field, direction: 'ascending'}]);
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

		item.direction = item.direction === 'ascending' ? 'descending' : 'ascending';

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
				'aria-sort':
					sorterItem == null ? 'none' : items.length > 1 ? 'other' : sorterItem.direction,
				'data-sort-direction': sorterItem == null ? undefined : sorterItem.direction,
			});

			setAttribute(
				column.elements.sorter,
				'data-sort-position',
				sorterIndex > -1 && items.length > 1 ? sorterIndex + 1 : undefined,
			);
		}

		state.managers.data.values.keys.active =
			items.length === 0 ? undefined : getSortedKeys(state, items);

		state.managers.render.update(true, true);
	}

	toggle(event: MouseEvent, field: string, direction?: string | null): void {
		switch (direction) {
			case 'ascending':
				this.flip(field);
				return;

			case 'descending':
				this.removeOrClear(event, field);
				return;

			default:
				this.addOrSet(event, field);
				return;
		}
	}
}

function getSortedKeys(
	state: State,
	sorters: ArrayKeySorter<PlainObject>[],
): Array<GroupComponent | Key> {
	const data =
		state.managers.data.values.keys.active?.map(key =>
			key instanceof GroupComponent ? key : state.managers.data.values.objects.mapped.get(key)!,
		) ?? state.managers.data.values.objects.array.slice();

	if (!state.managers.group.enabled) {
		return sort(data as PlainObject[], sorters).map(
			item => (item as PlainObject)[state.key] as Key,
		);
	}

	return sortWithGroups(state, data, sorters).map(item =>
		item instanceof GroupComponent ? item : (item[state.key] as Key),
	);
}

export function sortWithGroups(
	state: State,
	data: Array<GroupComponent | PlainObject>,
	sorters: ArrayKeySorter<PlainObject>[],
): Array<GroupComponent | PlainObject> {
	const {length} = sorters;

	return data.sort((first, second) => {
		const firstValue =
			first instanceof GroupComponent
				? first.value
				: (first as PlainObject)[state.managers.group.field];

		const secondValue =
			second instanceof GroupComponent
				? second.value
				: (second as PlainObject)[state.managers.group.field];

		const firstOrder = state.managers.group.order[firstValue as never];
		const secondOrder = state.managers.group.order[secondValue as never];

		const groupComparison = compare(firstOrder, secondOrder);

		if (groupComparison !== 0) {
			return groupComparison;
		}

		const firstIsGroup = first instanceof GroupComponent;
		const secondIsGroup = second instanceof GroupComponent;

		if (firstIsGroup || secondIsGroup) {
			return firstIsGroup && secondIsGroup ? 0 : firstIsGroup ? -1 : 1;
		}

		for (let index = 0; index < length; index += 1) {
			const sorter = sorters[index];

			const comparison = compare(first[sorter.key], second[sorter.key]);

			if (comparison !== 0) {
				return comparison * (sorter.direction === 'ascending' ? 1 : -1);
			}
		}

		return 0;
	});
}
