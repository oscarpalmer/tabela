export type TabelaColumn = {
	field: string;
	title: string;
	type: TabelaColumnType;
	width: number;
};

export type TabelaColumnOptions = {
	field: string;
	title: string;
	type: TabelaColumnType;
	width?: number;
};

export type TabelaColumnType = 'boolean' | 'date' | 'date-time' | 'number' | 'string' | 'time';
