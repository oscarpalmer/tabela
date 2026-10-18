import type {OuiResizable} from '@oscarpalmer/oui/resizable';
import type {State} from './tabela.model';

// #region Types

export type Column = {
	footer?: TabelaColumnFooter;
	key: string;
	label: string;
	type: TabelaColumnType;
	width: number;
};

export type ColumnComponent = {
	elements: ColumnComponentElements;
	key: ColumnComponentKey;
	options: Column;
	resizable: OuiResizable;
	destroy(): void;
};

export type ColumnComponentElements = {
	content: HTMLDivElement;
	filter: ColumnComponentElementsFilter;
	sorter: HTMLDivElement;
	wrapper: HTMLDivElement;
};

export type ColumnComponentElementsFilter = {
	button: HTMLButtonElement;
	input: ColumnComponentElementsFilterInput;
	list: ColumnComponentElementsFilterList;
	popover: HTMLDivElement;
};

export type ColumnComponentElementsFilterInput = {
	container: HTMLDivElement;
	label: HTMLLabelElement;
	input: HTMLInputElement;
};

export type ColumnComponentElementsFilterList = {
	container: HTMLDivElement;
	label: HTMLLabelElement;
	input: HTMLSelectElement;
};

export type ColumnComponentKey = {
	normalized: string;
	original: string;
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
	type?: TabelaColumnType;
	width?: number;
};

export type TabelaColumnFooter = 'average' | 'count' | 'max' | 'median' | 'min' | 'sum' | 'unique';

export type TabelaColumnType = 'boolean' | 'date' | 'number' | 'string';

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
