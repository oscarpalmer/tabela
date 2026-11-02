import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {OuiResizable} from '@oscarpalmer/oui/resizable';
import type {State} from './tabela.model';
import type {RenderCallbackResult} from './render.model';

// #region Types

export type Column = {
	filterable: boolean;
	footer?: TabelaColumnFooterAggregation | TabelaColumnFooterCallback;
	key: string;
	label: string | TabelaColumnLabelCallback;
	sortable: boolean;
	type: TabelaColumnType;
	width: number;
	render?: TabelaColumnRenderCallback;
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
	filter?: ColumnComponentElementsFilter;
	sorter?: HTMLDivElement;
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
	filterable?: boolean;
	footer?: TabelaColumnFooterAggregation | TabelaColumnFooterCallback;
	key: string;
	label?: string | TabelaColumnLabelCallback;
	render?: TabelaColumnRenderCallback;
	sortable?: boolean;
	type?: TabelaColumnType;
	width?: number;
};

export type TabelaColumnLabelCallback = () => RenderCallbackResult;

export type TabelaColumnFooterCallback = (data: PlainObject[]) => RenderCallbackResult;

export type TabelaColumnFooterAggregation =
	| 'average'
	| 'count'
	| 'max'
	| 'median'
	| 'min'
	| 'sum'
	| 'unique';

export type TabelaColumnRenderCallback = (
	value: unknown,
	row: PlainObject,
	index: number,
) => RenderCallbackResult;

export type TabelaColumnType = 'boolean' | 'date' | 'number' | 'string';

// #endregion

// #region Variables

export const columnFooterAggregation: Set<TabelaColumnFooterAggregation> = new Set([
	'average',
	'count',
	'max',
	'median',
	'min',
	'sum',
	'unique',
]);

// #endregion
