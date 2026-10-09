import type {State} from './tabela.model';

// #region Types

export type Column = {
	footer?: TabelaColumnFooter;
	key: string;
	label: string;
	width: number;
};

export type ColumnComponent = {
	elements: ColumnComponentElements;
	options: Column;
	destroy(): void;
};

export type ColumnComponentElements = {
	content: HTMLDivElement;
	sorter: HTMLDivElement;
	wrapper: HTMLDivElement;
};

export type ColumnManager = {
	items: ColumnComponent[];
	keys: string[];
	state: State;
	destroy(): void;
};

export type TabelaColumn = {
	footer?: TabelaColumnFooter;
	key: string;
	label?: string;
	width?: number;
};

export type TabelaColumnFooter = 'average' | 'count' | 'max' | 'median' | 'min' | 'sum' | 'unique';

// #endregion

// #region Variables

export const columnFooters: Set<TabelaColumnFooter> = new Set([
	'average',
	'count',
	'max',
	'median',
	'min',
	'sum',
	'unique',
]);

// #endregion
