import {sort} from '@oscarpalmer/atoms/array';
import type {Key} from '@oscarpalmer/atoms/models';
import {setAttribute, setAttributes} from '@oscarpalmer/toretto/attribute';
import type {SortDirection, SortItem} from '../models/sort.model';
import type {TabelaManagers, TabelaSort} from '../models/tabela.model';

export class SortManager {
	readonly handlers = Object.freeze({
		add: (field, direction) => this.add(field, direction),
		flip: field => this.flip(field),
		clear: () => this.clear(),
		remove: field => this.remove(field),
		set: items => this.set(items),
	} satisfies TabelaSort);

	readonly items: SortItem[] = [];

	constructor(readonly managers: TabelaManagers) {}

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
			this.set([{key: field, direction: 'ascending'}]);
		}
	}

	clear(): void {
		this.items.length = 0;

		this.sort();
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
		this.items.splice(0, this.items.length, ...items);

		this.sort();
	}

	sort(): void {
		const {items, managers} = this;

		managers.data.values.keys.active =
			items.length === 0
				? undefined
				: (sort(managers.data.values.objects.array, items).map(
						row => row[managers.data.field],
					) as Key[]);

		managers.virtualization.update(true, true);

		for (const column of managers.column.items) {
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
