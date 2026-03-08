import type {Key} from '@oscarpalmer/atoms/models';
import {removeRow, renderRow, RowComponent} from '../components/row.component';
import type {State} from '../models/tabela.model';

export class RowManager {
	components = new Map<Key, RowComponent>();

	constructor(public state: State) {}

	destroy(): void {
		const components = [...this.components.values()];
		const {length} = components;

		for (let index = 0; index < length; index += 1) {
			removeRow(this.state.managers.render.pool, components[index]);
		}

		this.components.clear();

		this.components = undefined as never;
		this.state = undefined as never;
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
			removeRow(this.state.managers.render.pool, row);

			this.components.delete(key);
		}
	}

	update(key: Key): void {
		const row = this.components.get(key);

		if (row != null) {
			renderRow(this.state, row);
		}
	}
}
