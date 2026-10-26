import {filter} from '@oscarpalmer/atoms/array/filter';
import {sort} from '@oscarpalmer/atoms/array/sort';
import {toMap} from '@oscarpalmer/atoms/array/to-map';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {RENDER_ORIGIN_DATA} from '../../models/render.model';
import type {State} from '../../models/tabela.model';
import {isGroupKey} from '../group/group.misc';
import {renderOrigin} from '../render/render.work';
import {sortGroupedData} from '../sort/sort.event';

// #region Functions

export function renderData(state: State): void {
	const {key, managers, options} = state;
	const {data, group} = managers;
	const {keys, values} = data.store;

	if (group.enabled) {
		sortGroupedData(state, values.array, managers.sort.default);
	} else {
		sort(values.array as PlainObject[], managers.sort.default);
	}

	keys.all.active = undefined;
	keys.row.active = undefined;

	const original = values.array.map(item =>
		typeof item === 'string' ? item : (getValue(item, key, options.relaxedKeys) as Key),
	);

	keys.all.original = original;
	keys.row.original = filter.remove(original, isGroupKey);

	values.mapped = toMap(
		filter.remove(values.array, isGroupKey) as PlainObject[],
		item => getValue(item, key, options.relaxedKeys) as Key,
	);

	renderOrigin(state, RENDER_ORIGIN_DATA);
}

// #endregion
