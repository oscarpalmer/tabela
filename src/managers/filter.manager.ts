import {getNumber} from '@oscarpalmer/atoms/number';
import {getString} from '@oscarpalmer/atoms/string';
import {endsWith, includes, startsWith} from '@oscarpalmer/atoms/string/match';
import {equal} from '@oscarpalmer/atoms/value/equal';
import {GroupComponent} from '../components/group.component';
import type {DataItem} from '../models/data.model';
import {
	FILTER_CONTAINS,
	FILTER_ENDS_WITH,
	FILTER_EQUALS,
	FILTER_GREATER_THAN,
	FILTER_GREATER_THAN_OR_EQUAL,
	FILTER_LESS_THAN,
	FILTER_LESS_THAN_OR_EQUAL,
	FILTER_NOT_CONTAINS,
	FILTER_NOT_EQUALS,
	FILTER_STARTS_WITH,
	type TabelaFilter,
	type TabelaFilterItem,
} from '../models/filter.model';
import type {State} from '../models/tabela.model';

export class FilterManager {
	handlers = Object.freeze({
		add: item => this.add(item),
		clear: () => this.clear(),
		remove: value => this.remove(value),
		set: items => this.set(items),
	} satisfies TabelaFilter);

	items: Record<string, TabelaFilterItem[]> = {};

	constructor(public state: State) {}

	add(item: TabelaFilterItem): void {
		if (this.items[item.field] == null) {
			this.items[item.field] = [];
		} else {
			const index = this.items[item.field].findIndex(existing => equal(existing, item));

			if (index > -1) {
				return;
			}
		}

		this.items[item.field].push(item);

		this.filter();
	}

	clear(): void {
		if (Object.keys(this.items).length > 0) {
			this.items = {};

			this.filter();
		}
	}

	destroy(): void {
		this.handlers = undefined as never;
		this.items = undefined as never;
		this.state = undefined as never;
	}

	filter(): void {
		const {state} = this;

		const filtered: DataItem[] = [];
		const filters = Object.entries(this.items);

		const itemsLength = state.managers.data.state.items.original.length;

		rowLoop: for (let itemIndex = 0; itemIndex < itemsLength; itemIndex += 1) {
			const item = state.managers.data.state.items.original[itemIndex];

			if (item instanceof GroupComponent) {
				filtered.push(item);

				continue;
			}

			const row = state.managers.data.state.values.mapped.get(item);

			if (row == null) {
				continue;
			}

			filterLoop: for (let filterIndex = 0; filterIndex < filters.length; filterIndex += 1) {
				const [field, items] = filters[filterIndex];

				const value = row[field];

				for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
					const filter = items[itemIndex];

					if (comparators[filter.comparison](value, filter.value)) {
						continue filterLoop;
					}
				}

				continue rowLoop;
			}

			filtered.push(item);
		}

		state.managers.data.state.items.active = filtered;

		if (state.managers.sort.items.length > 0) {
			state.managers.sort.sort();
		} else {
			state.managers.render.update(true, true);
		}
	}

	remove(value: string | TabelaFilterItem): void {
		if (typeof value === 'string') {
			if (this.items[value] == null) {
				return;
			}

			const keyed: Record<string, TabelaFilterItem[]> = {};

			const filters = Object.keys(this.items);
			const {length} = filters;

			for (let index = 0; index < length; index += 1) {
				const field = filters[index];

				if (field !== value) {
					keyed[field] = this.items[field];
				}
			}

			this.items = keyed;
		} else {
			const {field} = value;

			if (this.items[field] == null) {
				return;
			}

			const index = this.items[field].findIndex(item => equal(item, value));

			if (index === -1) {
				return;
			}
		}

		this.filter();
	}

	set(items: TabelaFilterItem[]): void {
		const keyed: Record<string, TabelaFilterItem[]> = {};

		const {length} = items;

		for (let index = 0; index < length; index += 1) {
			const item = items[index];

			keyed[item.field] ??= [];

			keyed[item.field].push(item);
		}

		this.items = keyed;

		this.filter();
	}
}

const comparators: Record<string, (row: unknown, filter: unknown) => boolean> = {
	[FILTER_CONTAINS]: (row, filter) => includes(getString(row), getString(filter), true),
	[FILTER_ENDS_WITH]: (row, filter) => endsWith(getString(row), getString(filter), true),
	[FILTER_EQUALS]: (row, filter) => equalizer(row, filter),
	[FILTER_GREATER_THAN]: (row, filter) => getNumber(row) > getNumber(filter),
	[FILTER_GREATER_THAN_OR_EQUAL]: (row, filter) => getNumber(row) >= getNumber(filter),
	[FILTER_LESS_THAN]: (row, filter) => getNumber(row) < getNumber(filter),
	[FILTER_LESS_THAN_OR_EQUAL]: (row, filter) => getNumber(row) <= getNumber(filter),
	[FILTER_NOT_CONTAINS]: (row, filter) => !includes(getString(row), getString(filter), true),
	[FILTER_NOT_EQUALS]: (row, filter) => !equalizer(row, filter),
	[FILTER_STARTS_WITH]: (row, filter) => startsWith(getString(row), getString(filter), true),
};

const equalizer = equal.initialize({
	ignoreCase: true,
});
