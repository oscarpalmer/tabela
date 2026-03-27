import {tabela, type Tabela, type TabelaOptions} from '@oscarpalmer/tabela';
import { setupLoggers } from './loggers';

declare global {
	interface Window {
		tabela?: Tabela;
	}
}

const columns: TabelaOptions['columns'] = [
	{
		key: 'id',
		label: 'ID',
	},
	{
		key: 'name.first',
		label: 'Name',
	},
	{
		footer: 'sum',
		key: 'age',
		label: 'Age',
	},
	{
		key: 'active',
		label: 'Active',
	},
];

const options: TabelaOptions = {
	columns,
	data: [],
	grouping: 'age',
	key: 'id',
	label: 'Tabela',
	rowHeight: 32,
};

let table: Tabela | undefined;

export function createTable(element: HTMLElement): Tabela {
	if (table != null) {
		return table;
	}

	table = tabela(element, options);

	window.tabela = table;

	setupLoggers(table);

	return table;
}

export function tableData(): Tabela['data'] | undefined {
	return table?.data;
}

export function tableFilter(): Tabela['filter'] | undefined {
	return table?.filter;
}

export function tableGroup(): Tabela['group'] | undefined {
	return table?.group;
}

export function tableSelection(): Tabela['selection'] | undefined {
	return table?.selection;
}

export function tableSort(): Tabela['sort'] | undefined {
	return table?.sort;
}
