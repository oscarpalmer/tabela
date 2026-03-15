import {tabela, type Tabela, type TabelaOptions} from '@oscarpalmer/tabela';

const columns: TabelaOptions['columns'] = [
	{
		field: 'id',
		title: 'ID',
		type: 'number',
	},
	{
		field: 'name.first',
		title: 'Name',
		type: 'string',
	},
	{
		field: 'age',
		title: 'Age',
		type: 'number',
	},
	{
		field: 'active',
		title: 'Active',
		type: 'boolean',
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

let table: Tabela;

export function createTable(element: HTMLElement): Tabela {
	if (table != null) {
		return table;
	}

	table = tabela(element, options);

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
