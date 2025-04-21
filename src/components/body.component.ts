import type {PlainObject} from '@oscarpalmer/atoms/models';
import {createRowGroup} from '../helpers/dom.helpers';
import {VirtualizationManager} from '../managers/virtualization.manager';
import type {Tabela} from '../tabela';
import {RowComponent} from './row.component';

type Elements = {
	faker: HTMLDivElement;
	group: HTMLDivElement;
};

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
	readonly elements: Elements = {
		faker: createFaker(),
		group: undefined as never,
	};

	readonly rows: RowComponent[] = [];
	readonly virtualization: VirtualizationManager;

	constructor(readonly tabela: Tabela) {
		const group = createRowGroup(false);

		this.elements.group = group;
		this.virtualization = new VirtualizationManager(this);

		group.className += ' tabela__rowgroup-body';

		group.style.height = '100%';
		group.style.overflow = 'auto';
		group.style.position = 'relative';

		group.append(this.elements.faker);

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

	destroy(): void {
		this.virtualization.destroy();

		this.elements.faker = undefined as never;
		this.elements.group = undefined as never;
		this.rows.length = 0;
	}

	private updateVirtualization(): void {
		this.elements.faker.style.height = `${this.rows.length * 32}px`;

		this.virtualization.update(true);
	}
}


