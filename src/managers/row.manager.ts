import type {Key} from '@oscarpalmer/atoms/models';
import {RowComponent} from '../components/row.component';
import type {Tabela} from '../tabela';

export class RowManager {
	readonly components: Map<Key, RowComponent> = new Map();

	readonly height: number;

	constructor(
		readonly tabela: Tabela,
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
}
