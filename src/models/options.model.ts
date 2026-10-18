import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {TabelaColumn} from './column.model';

// #region Types

export type Options = {
	columns: TabelaColumn[];
	data: PlainObject[];
	footer?: boolean;
	grouping?: string;
	key: string;
	label: string;
	relaxedKeys: boolean;
	rowHeight: number;
	sorting?: string;
};

export type TabelaOptions = {
	columns: TabelaColumn[];
	data: PlainObject[];
	footer?: boolean;
	grouping?: string;
	key: string;
	label: string;
	relaxedKeys?: boolean;
	rowHeight: number;
	sorting?: string;
};

// #endregion
