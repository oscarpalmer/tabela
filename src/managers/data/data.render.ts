import {sort} from '@oscarpalmer/atoms/array';
import {toMap} from '@oscarpalmer/atoms/array/to-map';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {isGroupKey} from '../../helpers/misc.helpers';
import type {DataState} from '../../models/data.model';
import {SORT_ASCENDING} from '../../models/sort.model';
import {sortWithGroups} from '../sort.manager';

export function renderData(state: DataState): void {
	if (state.managers.group.enabled) {
		sortWithGroups(state, state.values.array, [
			{
				direction: SORT_ASCENDING,
				key: state.key,
			},
		]);
	} else {
		sort(state.values.array as PlainObject[], [
			{
				direction: SORT_ASCENDING,
				key: state.key,
			},
		]);
	}

	state.keys.active = undefined;

	state.keys.original = state.values.array.map(item =>
		typeof item === 'string' ? item : (getValue(item, state.key) as Key),
	);

	state.values.mapped = toMap(
		state.values.array.filter(item => !isGroupKey(item)) as PlainObject[],
		item => getValue(item, state.key) as Key,
	);

	state.managers.render.render('data');
}
