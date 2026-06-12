// #region Types

export type GroupValue = {
	original: unknown;
	stringified: string;
};

export type TabelaGroup = {
	value: unknown;
};

export type TabelaGroupHandlers = {
	set(key?: string): void;
};

export type TabelaGroupToggle = {
	collapsed: TabelaGroup[];
	expanded: TabelaGroup[];
};

// #endregion

// #region Variables

export const GROUP_KEY_EXPRESSION = /^group:(.+)$/;

export const GROUP_KEY_PREFIX = 'group:';

// #endregion
