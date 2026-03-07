import type {Key} from '@oscarpalmer/atoms/models';
import {removeRow, renderRow, RowComponent} from '../components/row.component';
import type {TabelaManagers} from '../models/tabela.model';

export class RowManager {
	readonly components: Map<Key, RowComponent> = new Map();

	readonly height: number;

	constructor(
		readonly managers: TabelaManagers,
		rowHeight: number,
	) {
		this.height = rowHeight;
	}

	destroy(): void {
		const components = [...this.components.values()];

		const {length} = components;

		for (let index = 0; index < length; index += 1) {
			removeRow(this.managers.virtualization.pool, components[index]);
		}

		this.components.clear();
	}

	get(key: Key): RowComponent | undefined {
		let row = this.components.get(key);

		if (row == null) {
			row = new RowComponent(key);

			this.components.set(key, row);
		}

		return row;
	}

	has(key: Key): boolean {
		return this.components.has(key);
	}

	remove(key: Key): void {
		const row = this.components.get(key);

		if (row != null) {
			removeRow(this.managers.virtualization.pool, row);

			this.components.delete(key);
		}
	}

	update(key: Key): void {
		const row = this.components.get(key);

		if (row != null) {
			renderRow(this.managers, row);
		}
	}
}
