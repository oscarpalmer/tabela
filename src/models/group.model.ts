import type {Key} from '@oscarpalmer/atoms/models';
import type {State, SYMBOL} from './tabela.model';

// #region Types

export type Group = {
	value: unknown;
};

export type GroupComponent = {
	element: HTMLElement | undefined;
	expanded: boolean;
	filtered: number;
	key: GroupComponentKey;
	label: string;
	selected: number;
	total: number;
	value: GroupValue;
};

export type GroupComponentKey = {
	full: string;
	short: Key;
};

export type GroupManager = {
	collapsed: Set<Key>;
	enabled: boolean;
	handlers: TabelaGroup;
	items: GroupComponent[];
	key: string;
	mapped: Map<string, GroupComponent>;
	order: Record<never, number>;
	state: State;
	destroy(): void;
};

export type GroupToggle = {
	collapsed: Group[];
	expanded: Group[];
};

export type GroupValue = {
	original: unknown;
	stringified: string;
};

export type TabelaGroup = {
	[SYMBOL]: State;
	set(key?: string): void;
};

// #endregion

// #region Variables

export const GROUP_KEY_EXPRESSION: RegExp = /^group:(.+)$/;

export const GROUP_KEY_PREFIX = 'group:';

// #endregion
