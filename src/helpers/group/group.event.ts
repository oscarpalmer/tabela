import type {Key} from '@oscarpalmer/atoms/models';
import {findAncestor} from '@oscarpalmer/toretto/find';
import {EVENT_GROUP_TOGGLE} from '../../models/event.model';
import type {GroupComponent} from '../../models/group.model';
import {RENDER_ORIGIN_DATA} from '../../models/render.model';
import {CSS_CELL_GROUP} from '../../models/style.model';
import type {State} from '../../models/tabela.model';
import {focusNavigation} from '../navigation/navigation.event';
import {renderOrigin} from '../render/render.work';
import {updateGroup} from './group.dom';
import {getGroupForKey} from './group.item';
import {getTabelaGroup} from './group.misc';

// #region Functions

export function onGroup(state: State, button: HTMLElement): void {
	const cell = findAncestor(button, `.${CSS_CELL_GROUP}`) as HTMLElement;

	if (cell == null) {
		return;
	}

	const key = cell.dataset.key?.replace(`${state.prefix}_`, '');
	const group = getGroupForKey(state, key ?? '');

	if (group != null) {
		toggleGroup(state, group);
	}
}

export function toggleGroup(state: State, group: GroupComponent): void {
	const {managers} = state;
	const {data, event} = managers;
	const {store} = data;
	const {collapsed, items} = managers.group;

	group.expanded = !group.expanded;

	const index = items.indexOf(group);

	let first = store.keys.all.original.indexOf(group.key.full) + 1;

	const last =
		items[index + 1] == null
			? store.keys.all.original.length - 1
			: store.keys.all.original.indexOf(items[index + 1].key.full) - 1;

	for (; first <= last; first += 1) {
		const key = store.keys.all.original[first] as Key;

		if (group.expanded) {
			collapsed.delete(key);
		} else {
			collapsed.add(key);
		}
	}

	event.herald.emit(EVENT_GROUP_TOGGLE, {
		collapsed: group.expanded ? [] : [getTabelaGroup(group)],
		expanded: group.expanded ? [getTabelaGroup(group)] : [],
	});

	updateGroup(state, group, false);

	renderOrigin(state, RENDER_ORIGIN_DATA);

	focusNavigation(state);
}

// #endregion
