import {BodyComponent} from './components/body.component';
import {FooterComponent} from './components/footer.component';
import {HeaderComponent} from './components/header.component';
import {ColumnManager} from './managers/column.manager';
import {DataManager} from './managers/data.manager';
import {EventManager} from './managers/event.manager';
import {FilterManager} from './managers/filter.manager';
import {GroupManager} from './managers/group.manager';
import {NavigationManager} from './managers/navigation.manager';
import {RenderManager} from './managers/render.manager';
import {RowManager} from './managers/row.manager';
import {SelectionManager} from './managers/selection.manager';
import {SortManager} from './managers/sort.manager';
import type {TabelaData} from './models/data.model';
import type {TabelaFilter} from './models/filter.model';
import type {TabelaSelection} from './models/selection.model';
import type {TabelaSort} from './models/sort.model';
import type {Components, Managers, State} from './models/tabela.model';
import type {TabelaOptions} from './models/tabela.options';

export class Tabela {
	readonly #components: Components = {
		header: undefined as never,
		body: undefined as never,
		footer: undefined as never,
	};

	#element: HTMLElement;

	#id = getId();

	readonly #key: string;

	readonly #managers: Managers = {
		column: undefined as never,
		data: undefined as never,
		event: undefined as never,
		filter: undefined as never,
		group: undefined as never,
		navigation: undefined as never,
		render: undefined as never,
		row: undefined as never,
		selection: undefined as never,
		sort: undefined as never,
	};

	readonly data: TabelaData;

	readonly filter: TabelaFilter;

	readonly selection: TabelaSelection;

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

		const state: State = {
			element,
			options,
			components: this.#components,
			id: this.#id,
			key: this.#key,
			managers: this.#managers,
		};

		this.#managers.column = new ColumnManager(state);
		this.#managers.data = new DataManager(state);
		this.#managers.event = new EventManager(state);
		this.#managers.filter = new FilterManager(state);
		this.#managers.group = new GroupManager(state);
		this.#managers.navigation = new NavigationManager(state);
		this.#managers.render = new RenderManager(state);
		this.#managers.row = new RowManager(state);
		this.#managers.selection = new SelectionManager(state);
		this.#managers.sort = new SortManager(state);

		element.append(
			this.#components.header.elements.group,
			this.#components.body.elements.group,
			this.#components.footer.elements.group,
		);

		this.#managers.data.set(options.data);

		this.data = this.#managers.data.handlers;
		this.filter = this.#managers.filter.handlers;
		this.selection = this.#managers.selection.handlers;
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
		managers.event.destroy();
		managers.filter.destroy();
		// managers.navigation.destroy();
		managers.render.destroy();
		managers.row.destroy();
		managers.selection.destroy();
		managers.sort.destroy();

		element.innerHTML = '';
		element.role = '';

		element.classList.remove('tabela');
		element.removeAttribute('aria-label');
		element.removeAttribute('role');

		this.#element = undefined as never;
	}
}

function getId(): number {
	id += 1;

	return id;
}

let id = 0;
