export type GroupValue = {
	original: unknown;
	stringified: string;
};

export type TabelaGroup = {
	set(group?: string): void;
};

export const GROUP_KEY_EXPRESSION = /^group:(.+)$/;

export const GROUP_KEY_PREFIX = 'group:';
