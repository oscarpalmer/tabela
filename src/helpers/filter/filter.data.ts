import {filter} from '@oscarpalmer/atoms/array/filter';
import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
import {getNumber} from '@oscarpalmer/atoms/number';
import {endsWith, includes, startsWith} from '@oscarpalmer/atoms/string/match';
import {equal, type Equalizer} from '@oscarpalmer/atoms/value/equal';
import {
	FILTER_ENDS_WITH,
	FILTER_EQUALS,
	FILTER_GREATER_THAN,
	FILTER_GREATER_THAN_OR_EQUAL,
	FILTER_INCLUDES,
	FILTER_LESS_THAN,
	FILTER_LESS_THAN_OR_EQUAL,
	FILTER_NOT_EQUALS,
	FILTER_NOT_INCLUDES,
	FILTER_STARTS_WITH,
	type FilterComparator,
} from '../../models/filter.model';
import {RENDER_ORIGIN_FILTER} from '../../models/render.model';
import type {State} from '../../models/tabela.model';
import {updateGroups} from '../group/group.dom';
import {getGroup} from '../group/group.item';
import {isGroupKey} from '../group/group.misc';
import {renderOrigin} from '../render/render.work';

// #region Functions

export function filterData(state: State): void {
	const {managers} = state;
	const {data, group} = managers;
	const {store} = data;

	const filters = [...managers.filter.items]
		.flatMap(([key, items]) => items.map(item => ({...item, key})))
		.filter(filter => !isNullableOrWhitespace(filter.value));

	const filtersLength = filters.length;
	const noFilters = filtersLength === 0;

	for (const item of group.items) {
		item.filtered = noFilters ? undefined : 0;
	}

	if (noFilters) {
		store.keys.all.active = undefined;
		store.keys.row.active = undefined;

		updateGroups(state, group.items);

		renderOrigin(state, RENDER_ORIGIN_FILTER);

		return;
	}

	const keys: Map<string, Set<Key>> = new Map();

	for (let index = 0; index < filtersLength; index += 1) {
		const item = filters[index];

		const cache = state.managers.filter.cache.get(item.key);

		if (cache == null) {
			continue;
		}

		for (const [value, cached] of cache) {
			if (
				comparators[item.comparison](state, item, {
					item: cached,
					asString: value,
				})
			) {
				keys.set(item.key, keys.get(item.key)?.union(cached.keys) ?? cached.keys);
			}
		}
	}

	let set = new Set<Key>();

	for (const [, value] of keys) {
		set = set.union(value);
	}

	managers.filter.keys = set;

	const active = filter(
		store.keys.all.original,
		key => managers.group.mapped.has(key as never) || set.has(key),
	);

	store.keys.all.active = active;
	store.keys.row.active = filter.remove(active, isGroupKey);

	renderOrigin(state, RENDER_ORIGIN_FILTER);

	if (!managers.group.enabled) {
		return;
	}

	for (const key of set) {
		const group = getGroup(state, key, 'row');

		if (group?.filtered != null) {
			group.filtered += 1;
		}
	}

	updateGroups(state, group.items);
}

// #endregion

// #region Variables

const comparators: Record<string, FilterComparator> = {
	[FILTER_ENDS_WITH]: (state, filter, value) =>
		endsWith(value.asString, filter.asString, state.options.relaxedKeys),
	[FILTER_EQUALS]: (_, filter, value) => equalizer.compare(value.item.value, filter.value),
	[FILTER_GREATER_THAN]: (_, filter, value) =>
		getNumber(value.item.value) > getNumber(filter.value),
	[FILTER_GREATER_THAN_OR_EQUAL]: (_, filter, value) =>
		getNumber(value.item.value) >= getNumber(filter.value),
	[FILTER_INCLUDES]: (state, filter, value) => {
		if (Array.isArray(filter.value)) {
			return filter.value.includes(value.item.id);
		}

		return includes(value.asString, filter.asString, state.options.relaxedKeys);
	},
	[FILTER_LESS_THAN]: (_, filter, value) => getNumber(value.item.value) < getNumber(filter.value),
	[FILTER_LESS_THAN_OR_EQUAL]: (_, filter, value) =>
		getNumber(value.item.value) <= getNumber(filter.value),
	[FILTER_NOT_EQUALS]: (_, filter, value) => !equalizer.compare(value.item.value, filter.value),
	[FILTER_NOT_INCLUDES]: (state, filter, value) =>
		!includes(value.asString, filter.asString, state.options.relaxedKeys),
	[FILTER_STARTS_WITH]: (state, filter, value) =>
		startsWith(value.asString, filter.asString, state.options.relaxedKeys),
};

const equalizer: Equalizer = equal.initialize({
	ignoreCase: true,
});

// #endregion
