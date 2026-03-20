export type Column = {
	footer?: TabelaColumnFooter;
	key: string;
	label: string;
	width: number;
};

export type TabelaColumn = {
	footer?: TabelaColumnFooter;
	key: string;
	label?: string;
	width?: number;
};

export type TabelaColumnFooter = 'average' | 'count' | 'max' | 'median' | 'min' | 'sum' | 'unique';

export const columnFooters = new Set<TabelaColumnFooter>([
	'average',
	'count',
	'max',
	'median',
	'min',
	'sum',
	'unique',
]);
