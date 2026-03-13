import {BodyComponent} from './components/body.component';
import {FooterComponent} from './components/footer.component';
import {HeaderComponent} from './components/header.component';
import {createElement} from './helpers/dom.helpers';
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
import {StyleManager} from './managers/style.manager';
import type {TabelaData} from './models/data.model';
import type {TabelaFilter} from './models/filter.model';
import type {TabelaGroup} from './models/group.model';
import type {TabelaSelection} from './models/selection.model';
import type {TabelaSort} from './models/sort.model';
import {CSS_TABELA, CSS_TABELA_TABLE} from './models/style.model';
import type {Components, Managers, State} from './models/tabela.model';
import type {TabelaOptions} from './models/tabela.options';

export class Tabela {
	#components: Components;

	#element: HTMLElement;

	#id = getId();

	#table: HTMLElement;

	#key: string;

	#managers: Managers = {
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
		style: undefined as never,
	};

	#state: State;

	readonly data: TabelaData;

	readonly filter: TabelaFilter;

	readonly group: TabelaGroup;

	readonly selection: TabelaSelection;

	readonly sort: TabelaSort;

	get key(): string {
		return this.#key;
	}

	constructor(element: HTMLElement, options: TabelaOptions) {
		this.#element = element;

		element.innerHTML = '';

		element.classList.add(CSS_TABELA);

		this.#table = createElement(
			'div',
			{
				className: CSS_TABELA_TABLE,
				role: 'table',
			},
			{
				'aria-label': options.label,
			},
		);

		this.#key = options.key;

		this.#components = {
			body: new BodyComponent(),
			footer: new FooterComponent(),
			header: new HeaderComponent(),
		};

		this.#state = {
			options,
			components: this.#components,
			element: this.#table,
			id: this.#id,
			key: this.#key,
			managers: this.#managers,
		};

		this.#managers.column = new ColumnManager(this.#state);
		this.#managers.data = new DataManager(this.#state);
		this.#managers.event = new EventManager(this.#state);
		this.#managers.filter = new FilterManager(this.#state);
		this.#managers.group = new GroupManager(this.#state);
		this.#managers.navigation = new NavigationManager(this.#state);
		this.#managers.render = new RenderManager(this.#state);
		this.#managers.row = new RowManager(this.#state);
		this.#managers.selection = new SelectionManager(this.#state);
		this.#managers.sort = new SortManager(this.#state);
		this.#managers.style = new StyleManager(this.#state);

		this.#table.append(
			this.#components.header.elements.group,
			this.#components.body.elements.group,
			this.#components.footer.elements.group,
		);

		element.append(this.#table);

		this.#managers.data.set(options.data);

		this.data = this.#managers.data.handlers;
		this.filter = this.#managers.filter.handlers;
		this.group = this.#managers.group.handlers;
		this.selection = this.#managers.selection.handlers;
		this.sort = this.#managers.sort.handlers;
	}

	destroy(): void {
		const components = this.#components;
		const managers = this.#managers;
		const element = this.#element;
		const table = this.#table;

		components.body.destroy();
		components.footer.destroy();
		components.header.destroy();

		managers.column.destroy();
		managers.data.destroy();
		managers.event.destroy();
		managers.filter.destroy();
		managers.group.destroy();
		managers.navigation.destroy();
		managers.render.destroy();
		managers.row.destroy();
		managers.selection.destroy();
		managers.sort.destroy();

		element.innerHTML = '';

		table.innerHTML = '';
		table.role = '';

		element.classList.remove(CSS_TABELA);

		table.removeAttribute('aria-label');
		table.removeAttribute('role');

		this.#state.components = undefined as never;
		this.#state.managers = undefined as never;
		this.#state.element = undefined as never;
		this.#state.options = undefined as never;

		this.#element = undefined as never;
		this.#table = undefined as never;
	}
}

function getId(): number {
	id += 1;

	return id;
}

let id = 0;
