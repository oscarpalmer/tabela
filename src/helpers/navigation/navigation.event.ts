import {
	NAVIGATION_KEY_HOME,
	navigationAbsoluteKeys,
	navigationAllKeys,
	navigationHorizntalKeys,
} from '../../models/navigation.model';
import type {State} from '../../models/tabela.model';
import {isGroupKey} from '../group/group.misc';
import {
	getNavigationColumnIndex,
	setAbsoluteNavigation,
	setDefaultNavigation,
	setNavigationOffset,
	setNavigationStyles,
} from './navigation.misc';

// #region Functions

export function focusNavigation(state: State): void {
	const {keys, size} = state.managers.data;
	const {active} = state.managers.navigation;

	if (active.index >= size) {
		const index = size - 1;
		const key = keys[index];

		active.index = index;
		active.row = key ?? 'header';

		if (key == null) {
			active.type = 'header';
		} else {
			active.type = isGroupKey(key) ? 'group' : 'row';
		}
	}

	setNavigationStyles(state);
}

export function handleNavigation(state: State, event: KeyboardEvent): void {
	if (!navigationAllKeys.has(event.key)) {
		return;
	}

	event.preventDefault();

	const {navigation} = state.managers;

	if (navigation.active.type == null) {
		setDefaultNavigation(state);

		return;
	}

	if (navigationAbsoluteKeys.has(event.key)) {
		setAbsoluteNavigation(navigation, event.key === NAVIGATION_KEY_HOME);
	} else if (navigationHorizntalKeys.has(event.key)) {
		navigation.active.column =
			state.managers.column.keys[getNavigationColumnIndex(state, event, navigation.active.column)];
	} else {
		setNavigationOffset(state, event);
	}

	setNavigationStyles(state);
}

// #endregion
