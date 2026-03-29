import {sort} from '@oscarpalmer/atoms/array/sort';
import {toMap} from '@oscarpalmer/atoms/array/to-map';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {isGroupKey} from '../../helpers/misc.helpers';
import type {DataState} from '../../models/data.model';
import {RENDER_ORIGIN_DATA} from '../../models/render.model';
import {sortWithGroups} from '../sort.manager';

export function renderData(state: DataState): void {
	if (state.managers.group.enabled) {
		sortWithGroups(state, state.values.array, state.managers.sort.default!);
	} else {
		sort(state.values.array as PlainObject[], state.managers.sort.default!);
	}

	state.keys.active = undefined;

	state.keys.original = state.values.array.map(item =>
		typeof item === 'string' ? item : (getValue(item, state.key) as Key),
	);

	state.values.mapped = toMap(
		state.values.array.filter(item => !isGroupKey(item)) as PlainObject[],
		item => getValue(item, state.key) as Key,
	);

	state.managers.render.render(RENDER_ORIGIN_DATA);
}
