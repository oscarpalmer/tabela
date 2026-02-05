import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {TabelaColumnOptions} from './column.model';

export type TabelaOptions = {
	columns: TabelaColumnOptions[];
	data: PlainObject[];
	key: string;
	label: string;
	rowHeight: number;
};
