import type {Key} from '@oscarpalmer/atoms/models';
import {renderRow, RowComponent} from '../components/row.component';
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
		this.components.delete(key);
	}

	update(key: Key): void {
		const row = this.components.get(key);

		if (row != null) {
			renderRow(this.managers, row);
		}
	}
}
