import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {TabelaColumn} from './column.model';
import type {RenderCallbackResult} from './render.model';

// #region Types

export type Options = {
	columns: TabelaColumn[];
	data: PlainObject[];
	filterable: boolean;
	footer?: boolean;
	grouping?: TabelaGrouping;
	key: string;
	label: string;
	relaxedKeys: boolean;
	rowHeight: number;
	sorting: string | boolean;
};

export type TabelaGrouping = {
	key: string;
	height?: number;
	label?: (parameters: TabelaGroupingLabelParameters) => RenderCallbackResult;
};

type TabelaGroupingLabelParameters = {
	expanded: boolean;
	filtered?: number;
	selected: number;
	total: number;
	value: unknown;
};

export type TabelaOptions = {
	columns: TabelaColumn[];
	data: PlainObject[];
	filterable: boolean;
	footer?: boolean;
	grouping?: string | TabelaGrouping;
	key: string;
	label: string;
	relaxedKeys?: boolean;
	rowHeight: number;
	sorting?: string | boolean;
};

// #endregion
