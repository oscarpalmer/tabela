import {type Group, GROUP_KEY_PREFIX, type GroupComponent} from '../../models/group.model';

// #region Functions

export function getTabelaGroup(group: GroupComponent): Group {
	return {
		value: group.value.original,
	};
}

export function isGroupKey(key: unknown): boolean {
	return typeof key === 'string' && key.startsWith(GROUP_KEY_PREFIX);
}

// #endregion
