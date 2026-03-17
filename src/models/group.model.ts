export type GroupValue = {
	original: unknown;
	stringified: string;
};

export type TabelaGroup = {
	value: unknown;
};

export type TabelaGroupHandlers = {
	set(group?: string): void;
};

export type TabelaGroupToggle = {
	collapsed: TabelaGroup[];
	expanded: TabelaGroup[];
};

export const GROUP_KEY_EXPRESSION = /^group:(.+)$/;

export const GROUP_KEY_PREFIX = 'group:';
