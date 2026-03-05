import {BodyComponent} from './components/body.component';
import {FooterComponent} from './components/footer.component';
import {HeaderComponent} from './components/header.component';
import {ColumnManager} from './managers/column.manager';
import {DataManager} from './managers/data.manager';
import {RowManager} from './managers/row.manager';
import {VirtualizationManager} from './managers/virtualization.manager';
import type {TabelaOptions} from './models/tabela.options';

type Components = {
	body: BodyComponent;
	footer: FooterComponent;
	header: HeaderComponent;
};

type Managers = {
	columns: ColumnManager;
	data: DataManager;
	rows: RowManager;
	virtualization: VirtualizationManager;
};

export class Tabela {
	readonly components: Components;
	readonly key: string;
	readonly managers: Managers;

	constructor(
		public element: HTMLElement,
		options: TabelaOptions,
	) {
		element.innerHTML = '';
		element.role = 'table';

		element.classList.add('tabela');

		element.setAttribute('aria-label', options.label);

		this.key = options.key;

		this.components = {
			header: new HeaderComponent(this),
			body: new BodyComponent(this),
			footer: new FooterComponent(this),
		};

		this.managers = {
			columns: new ColumnManager(this, options.columns),
			data: new DataManager(this, options.data),
			rows: new RowManager(this, options.rowHeight),
			virtualization: new VirtualizationManager(this),
		};

		element.append(
			this.components.header.elements.group,
			this.components.body.elements.group,
			this.components.footer.elements.group,
		);

		this.managers.data.update();
	}

	destroy(): void {
		const {components, element, managers} = this;

		components.body.destroy();
		components.footer.destroy();
		components.header.destroy();

		managers.columns.destroy();
		managers.data.destroy();
		managers.rows.destroy();

		element.innerHTML = '';
		element.role = '';

		element.classList.remove('tabela');
		element.removeAttribute('aria-label');
		element.removeAttribute('role');

		this.element = undefined as never;
	}
}
