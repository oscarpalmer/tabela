import type {PlainObject} from '@oscarpalmer/atoms/models';
import {createRowGroup} from '../helpers/dom.helpers';
import type {Tabela} from '../tabela';
import {RowComponent} from './row.component';

export class BodyComponent {
	readonly group: HTMLDivElement;
	readonly rows: RowComponent[] = [];

	constructor(readonly tabela: Tabela) {
		this.group = createRowGroup(false);

		this.group.className += ' tabela__rowgroup-body';

		this.addData(tabela.options.data);
	}

	addData(data: PlainObject[]): void {
		const {length} = data;

		for (let index = 0; index < length; index += 1) {
			const row = new RowComponent(this.tabela, data[index]);

			this.rows.push(row);
			this.group.append(row.element);
		}
	}
}
