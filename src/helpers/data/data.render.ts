import {filter} from '@oscarpalmer/atoms/array/filter';
import {sort} from '@oscarpalmer/atoms/array/sort';
import {toMap} from '@oscarpalmer/atoms/array/to-map';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {RENDER_ORIGIN_DATA} from '../../models/render.model';
import type {State} from '../../models/tabela.model';
import {isGroupKey} from '../group.helper';
import {render} from '../render.helper';
import {sortDataGrouped} from '../sort.helper';

// #region Functions

export function renderData(state: State): void {
	const {data} = state.managers.data;

	if (state.managers.group.enabled) {
		sortDataGrouped(state, data.values.array, state.managers.sort.default);
	} else {
		sort(data.values.array as PlainObject[], state.managers.sort.default);
	}

	data.keys.all.active = undefined;
	data.keys.row.active = undefined;

	const original = data.values.array.map(item =>
		typeof item === 'string' ? item : (getValue(item, state.key, state.options.relaxedKeys) as Key),
	);

	data.keys.all.original = original;
	data.keys.row.original = filter.remove(original, isGroupKey);

	data.values.mapped = toMap(
		filter.remove(data.values.array, isGroupKey) as PlainObject[],
		item => getValue(item, state.key, state.options.relaxedKeys) as Key,
	);

	render(state, RENDER_ORIGIN_DATA);
}

// #endregion
