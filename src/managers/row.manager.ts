import type {Key} from '@oscarpalmer/atoms/models';
import {removeRow, renderRow, RowComponent} from '../components/row.component';
import type {State} from '../models/tabela.model';

export class RowManager {
	components = new Map<Key, RowComponent>();

	constructor(public state: State) {}

	clear(): void {
		const {components} = this;

		const rows = [...components.values()];
		const {length} = rows;

		for (let index = 0; index < length; index += 1) {
			this.removeRow(rows[index]);
		}

		components.clear();
	}

	destroy(): void {
		this.clear();

		this.components = undefined as never;
		this.state = undefined as never;
	}

	get(key: Key, create: boolean): RowComponent | undefined {
		let row = this.components.get(key);

		if (row == null && create) {
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
			this.removeRow(row);
		}
	}

	removeRow(row: RowComponent): void {
		if (row.element != null) {
			removeRow(this.state.managers.render.pool, row);
		}

		this.components.delete(row.key);
	}

	update(key: Key): void {
		const row = this.components.get(key);

		if (row != null) {
			renderRow(this.state, row);
		}
	}
}
