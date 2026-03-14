export type GroupValue = {
	original: unknown;
	stringified: string;
};

export type TabelaGroup = {
	set(group?: string): void;
};
