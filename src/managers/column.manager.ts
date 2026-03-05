import {ColumnComponent} from '../components/column.component';
import type {TabelaColumnOptions} from '../models/column.model';
import type {Tabela} from '../tabela';

export class ColumnManager {
	readonly components: ColumnComponent[] = [];

	constructor(
		readonly tabela: Tabela,
		columns: TabelaColumnOptions[],
	) {
		this.set(columns);
	}

	destroy(): void {
		this.components.length = 0;
	}

	remove(field: string): void;

	remove(fields: string[]): void;

	remove(value: unknown): void {
		const {components, tabela} = this;

		const fields = (Array.isArray(value) ? value : [value]).filter(
			item => typeof item === 'string',
		);

		const {length} = fields;

		if (length === 0) {
			return;
		}

		for (let fieldIndex = 0; fieldIndex < length; fieldIndex += 1) {
			const componentIndex = components.findIndex(
				component => component.options.field === fields[fieldIndex],
			);

			if (componentIndex > -1) {
				components.splice(componentIndex, 1);
			}
		}

		tabela.components.header.update(components);
		tabela.components.footer.update(components);

		tabela.managers.virtualization.removeCells(fields);
	}

	set(columns: TabelaColumnOptions[]): void {
		const {components, tabela} = this;
		const {footer, header} = tabela.components;

		components.splice(
			0,
			components.length,
			...columns.map(column => new ColumnComponent(tabela, column)),
		);

		header.update(components);
		footer.update(components);
	}
}
