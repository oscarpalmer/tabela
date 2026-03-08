import type {Key} from '@oscarpalmer/atoms/models';
import {getNumber} from '@oscarpalmer/atoms/number';
import {getString} from '@oscarpalmer/atoms/string';
import {endsWith, includes, startsWith} from '@oscarpalmer/atoms/string/match';
import {equal} from '@oscarpalmer/atoms/value/equal';
import type {TabelaFilter, TabelaFilterComparison, TabelaFilterItem} from '../models/filter.model';
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

			if (index !== -1) {
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

		const filtered: Key[] = [];
		const filters = Object.entries(this.items);

		const keysLength = state.managers.data.values.keys.original.length;

		rowLoop: for (let keyIndex = 0; keyIndex < keysLength; keyIndex += 1) {
			const key = state.managers.data.values.keys.original[keyIndex];
			const row = state.managers.data.values.objects.mapped.get(key);

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

			filtered.push(key);
		}

		state.managers.data.values.keys.active = filtered;

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

const comparators: Record<TabelaFilterComparison, (row: unknown, filter: unknown) => boolean> = {
	contains: (row, filter) => includes(getString(row), getString(filter), true),
	'ends-with': (row, filter) => endsWith(getString(row), getString(filter), true),
	equals: (row, filter) => equalizer(row, filter),
	'greater-than': (row, filter) => getNumber(row) > getNumber(filter),
	'greater-than-or-equal': (row, filter) => getNumber(row) >= getNumber(filter),
	'less-than': (row, filter) => getNumber(row) < getNumber(filter),
	'less-than-or-equal': (row, filter) => getNumber(row) <= getNumber(filter),
	'not-contains': (row, filter) => !includes(getString(row), getString(filter), true),
	'not-equals': (row, filter) => !equalizer(row, filter),
	'starts-with': (row, filter) => startsWith(getString(row), getString(filter), true),
};

const equalizer = equal.initialize({
	ignoreCase: true,
});
