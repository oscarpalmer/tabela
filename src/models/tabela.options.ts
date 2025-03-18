import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {TabelaColumnOptions} from './column.model';

export type TabelaOptions = {
	columns: TabelaColumnOptions[];
	data: PlainObject[];
	label: string;
};
