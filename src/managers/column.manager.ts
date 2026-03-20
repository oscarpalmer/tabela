import {ColumnComponent} from '../components/column.component';
import {getValidColumn} from '../helpers/misc.helpers';
import type {TabelaColumn} from '../models/column.model';
import type {State} from '../models/tabela.model';

export class ColumnManager {
	items: ColumnComponent[] = [];

	constructor(public state: State) {
		this.set(state.options.columns);
	}

	destroy(): void {
		const {length} = this.items;

		for (let index = 0; index < length; index += 1) {
			this.items[index].destroy();
		}

		this.items = undefined as never;
		this.state = undefined as never;
	}

	get(key: string): ColumnComponent | undefined {
		return this.items.find(item => item.options.key === key);
	}

	remove(key: string): void;

	remove(keys: string[]): void;

	remove(value: unknown): void {
		const {items, state} = this;
		const {components, managers} = state;

		const keys = (Array.isArray(value) ? value : [value]).filter(item => typeof item === 'string');

		const {length} = keys;

		if (length === 0) {
			return;
		}

		for (let keyIndex = 0; keyIndex < length; keyIndex += 1) {
			const itemIndex = items.findIndex(component => component.options.key === keys[keyIndex]);

			if (itemIndex > -1) {
				items[itemIndex].destroy();

				items.splice(itemIndex, 1);
			}
		}

		components.header.set(items);
		components.footer.set(items);

		managers.render.removeCells(keys);
	}

	set(columns: TabelaColumn[]): void {
		const {items, state} = this;
		const {footer, header} = state.components;

		const validated = columns
			.map(getValidColumn)
			.filter((item): item is TabelaColumn => item != null);

		if (validated.length === 0) {
			return;
		}

		items.splice(0, items.length, ...validated.map(column => new ColumnComponent(column)));

		header.set(items);
		footer.set(items);
	}
}
