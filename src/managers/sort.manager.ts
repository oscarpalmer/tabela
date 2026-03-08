import {sort, type ArrayKeySorter} from '@oscarpalmer/atoms/array';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {setAttribute, setAttributes} from '@oscarpalmer/toretto/attribute';
import type {SortDirection, SortItem} from '../models/sort.model';
import type {TabelaSort, TabelaState} from '../models/tabela.model';

export class SortManager {
	handlers = Object.freeze({
		add: (field, direction) => this.add(field, direction),
		flip: field => this.flip(field),
		clear: () => this.clear(),
		remove: field => this.remove(field),
		set: items => this.set(items),
	} satisfies TabelaSort);

	items: ArrayKeySorter<PlainObject>[] = [];

	constructor(public state: TabelaState) {}

	add(field: string, direction?: SortDirection): void {
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

	set(items: SortItem[]): void {
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
			items.length === 0
				? undefined
				: (sort(
						state.managers.data.values.keys.active?.map(
							key => state.managers.data.values.objects.mapped.get(key)!,
						) ?? state.managers.data.values.objects.array,
						items,
					).map(row => row[state.key]) as Key[]);

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
