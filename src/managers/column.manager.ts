import {ColumnComponent} from '../components/column.component';
import type {TabelaColumnOptions} from '../models/column.model';
import type {TabelaComponents, TabelaManagers} from '../models/tabela.model';

export class ColumnManager {
	readonly items: ColumnComponent[] = [];

	constructor(
		public managers: TabelaManagers,
		public components: TabelaComponents,
		columns: TabelaColumnOptions[],
	) {
		this.set(columns);
	}

	destroy(): void {
		this.items.length = 0;
	}

	remove(field: string): void;

	remove(fields: string[]): void;

	remove(value: unknown): void {
		const {components, items, managers} = this;

		const fields = (Array.isArray(value) ? value : [value]).filter(
			item => typeof item === 'string',
		);

		const {length} = fields;

		if (length === 0) {
			return;
		}

		for (let fieldIndex = 0; fieldIndex < length; fieldIndex += 1) {
			const itemIndex = items.findIndex(
				component => component.options.field === fields[fieldIndex],
			);

			if (itemIndex > -1) {
				items.splice(itemIndex, 1);
			}
		}

		components.header.update(items);
		components.footer.update(items);

		managers.virtualization.removeCells(fields);
	}

	set(columns: TabelaColumnOptions[]): void {
		const {components, items} = this;
		const {footer, header} = components;

		items.splice(0, items.length, ...columns.map(column => new ColumnComponent(column)));

		header.update(items);
		footer.update(items);
	}
}
