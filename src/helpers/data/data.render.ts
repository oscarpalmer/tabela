import {sort} from '@oscarpalmer/atoms/array/sort';
import {toMap} from '@oscarpalmer/atoms/array/to-map';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {isGroupKey} from '../../helpers/misc.helpers';
import {render} from '../../managers/render.manager';
import {sortDataGrouped} from '../../managers/sort.manager';
import {RENDER_ORIGIN_DATA} from '../../models/render.model';
import type {State} from '../../models/tabela.model';

// #region Functions

export function renderData(state: State): void {
	const {data} = state.managers.data;

	if (state.managers.group.enabled) {
		sortDataGrouped(state, data.values.array, state.managers.sort.default!);
	} else {
		sort(data.values.array as PlainObject[], state.managers.sort.default!);
	}

	data.keys.active = undefined;

	data.keys.original = data.values.array.map(item =>
		typeof item === 'string' ? item : (getValue(item, state.key) as Key),
	);

	data.values.mapped = toMap(
		data.values.array.filter(item => !isGroupKey(item)) as PlainObject[],
		item => getValue(item, state.key) as Key,
	);

	render(state, RENDER_ORIGIN_DATA);
}

// #endregion
