import {BodyComponent} from './components/body.component';
import {FooterComponent} from './components/footer.component';
import {HeaderComponent} from './components/header.component';
import {ColumnManager} from './managers/column.manager';
import {DataManager} from './managers/data.manager';
import {EventManager} from './managers/event.manager';
import {RowManager} from './managers/row.manager';
import {SortManager} from './managers/sort.manager';
import {VirtualizationManager} from './managers/virtualization.manager';
import type {TabelaComponents, TabelaData, TabelaManagers, TabelaSort} from './models/tabela.model';
import type {TabelaOptions} from './models/tabela.options';

export class Tabela {
	readonly #components: TabelaComponents = {
		header: undefined as never,
		body: undefined as never,
		footer: undefined as never,
	};

	#element: HTMLElement;

	readonly #key: string;

	readonly #managers: TabelaManagers = {
		column: undefined as never,
		data: undefined as never,
		event: undefined as never,
		row: undefined as never,
		sort: undefined as never,
		virtualization: undefined as never,
	};

	readonly data: TabelaData;

	readonly sort: TabelaSort;

	get key(): string {
		return this.#key;
	}

	constructor(element: HTMLElement, options: TabelaOptions) {
		this.#element = element;

		element.innerHTML = '';
		element.role = 'table';

		element.classList.add('tabela');

		element.setAttribute('aria-label', options.label);

		this.#key = options.key;

		this.#components.header = new HeaderComponent();
		this.#components.body = new BodyComponent();
		this.#components.footer = new FooterComponent();

		this.#managers.column = new ColumnManager(this.#managers, this.#components, options.columns);
		this.#managers.data = new DataManager(this.#managers, this.#components, options.key);
		this.#managers.event = new EventManager(this.#managers, this.#element);
		this.#managers.row = new RowManager(this.#managers, options.rowHeight);
		this.#managers.sort = new SortManager(this.#managers);
		this.#managers.virtualization = new VirtualizationManager(this.#managers, this.#components);

		element.append(
			this.#components.header.elements.group,
			this.#components.body.elements.group,
			this.#components.footer.elements.group,
		);

		this.#managers.data.set(options.data);

		this.data = this.#managers.data.handlers;
		this.sort = this.#managers.sort.handlers;
	}

	destroy(): void {
		const components = this.#components;
		const managers = this.#managers;
		const element = this.#element;

		components.body.destroy();
		components.footer.destroy();
		components.header.destroy();

		managers.column.destroy();
		managers.data.destroy();
		managers.row.destroy();
		managers.virtualization.destroy();

		element.innerHTML = '';
		element.role = '';

		element.classList.remove('tabela');
		element.removeAttribute('aria-label');
		element.removeAttribute('role');

		this.#element = undefined as never;
	}
}
