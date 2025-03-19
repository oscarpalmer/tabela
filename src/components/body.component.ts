import type {PlainObject} from '@oscarpalmer/atoms/models';
import {createRowGroup} from '../helpers/dom.helpers';
import {VirtualizationManager} from '../managers/virtualization.manager';
import type {Tabela} from '../tabela';
import {RowComponent} from './row.component';

function createFaker(): HTMLDivElement {
	const element = document.createElement('div');

	element.style.height = '0';
	element.style.inset = '0 auto auto 0';
	element.style.opacity = '0';
	element.style.pointerEvents = 'none';
	element.style.position = 'absolute';
	element.style.width = '1px';

	return element;
}

export class BodyComponent {
	readonly faker = createFaker();
	readonly group: HTMLDivElement;
	readonly rows: RowComponent[] = [];
	readonly virtualization: VirtualizationManager;

	constructor(readonly tabela: Tabela) {
		this.group = createRowGroup(false);
		this.virtualization = new VirtualizationManager(this);

		this.group.className += ' tabela__rowgroup-body';

		this.group.style.height = '100%';
		this.group.style.overflow = 'auto';
		this.group.style.position = 'relative';

		this.group.append(this.faker);

		void this.addData(tabela.options.data).then(() => {
			this.virtualization.update(true);
		});
	}

	async addData(data: PlainObject[]): Promise<void> {
		const {length} = data;

		for (let index = 0; index < length; index += 1) {
			this.rows.push(new RowComponent(this.tabela, data[index]));
		}

		this.updateVirtualization();
	}

	private updateVirtualization(): void {
		this.faker.style.height = `${this.rows.length * 32}px`;

		this.virtualization.update(true);
	}
}


