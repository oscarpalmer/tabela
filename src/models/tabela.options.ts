import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {TabelaColumn} from './column.model';

export type TabelaOptions = {
	columns: TabelaColumn[];
	data: PlainObject[];
	key: string;
	label: string;
	rowHeight: number;
};
