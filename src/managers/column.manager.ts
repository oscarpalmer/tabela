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
