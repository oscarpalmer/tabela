import {createElement} from '@oscarpalmer/toretto/create';
import {createBody} from '../components/body.component';
import {createFooter} from '../components/footer.component';
import {createHeader} from '../components/header.component';
import {createColumnManager} from '../managers/column.manager';
import {createDataManager} from '../managers/data.manager';
import {createEventManager} from '../managers/event.manager';
import {createFilterManager} from '../managers/filter.manager';
import {createGroupManager} from '../managers/group.manager';
import {createNavigationManager} from '../managers/navigation.manager';
import {createRenderManager} from '../managers/render.manager';
import {createRowManager} from '../managers/row.manager';
import {createSelectionManager} from '../managers/selection.manager';
import {createSortManager} from '../managers/sort.manager';
import {createStyleManager} from '../managers/style.manager';
import {
	ARIA_LABEL,
	ARIA_ROWCOUNT,
	ATTRIBUTE_DATA_EVENT,
	ELEMENT_DIV,
	ROLE_GRID,
} from '../models/dom.model';
import type {TabelaOptions} from '../models/options.model';
import {CSS_TABLE, CSS_WRAPPER} from '../models/style.model';
import {type State, SYMBOL, type Tabela} from '../models/tabela.model';
import {setColumns} from './column.helper';
import {initializeNavigation} from './navigation.helper';

// #region Functions

export function destroyTabela(this: Tabela): void {
	const state = this[SYMBOL];

	const {components, managers, elements} = state;

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

	elements.wrapper.innerHTML = '';

	elements.wrapper.classList.remove(CSS_WRAPPER);

	elements.table.innerHTML = '';
	elements.table.role = '';

	elements.table.removeAttribute(ARIA_LABEL);

	state.components = undefined as never;
	state.elements = undefined as never;
	state.managers = undefined as never;
	state.options = undefined as never;
}

export function initializeTabela(
	tabela: Tabela,
	element: HTMLElement,
	options: TabelaOptions,
): State {
	const id = getId();

	element.innerHTML = '';

	element.classList.add(CSS_WRAPPER);

	const table = createElement(ELEMENT_DIV, {
		attribute: {
			[ARIA_LABEL]: options.label,
			[ARIA_ROWCOUNT]: '0',
			[ATTRIBUTE_DATA_EVENT]: 'table',
		},
		property: {
			className: CSS_TABLE,
			role: ROLE_GRID,
		},
	});

	const state: State = {
		id,
		options,
		components: {} as never,
		elements: {
			table,
			wrapper: element,
		},
		key: options.key,
		managers: {} as never,
		prefix: `tabela_${id}`,
	};

	state.components.body = createBody(state);
	state.components.footer = createFooter(state);
	state.components.header = createHeader(state);

	state.managers.column = createColumnManager(state);
	state.managers.data = createDataManager(state);
	state.managers.event = createEventManager(state);
	state.managers.filter = createFilterManager(state);
	state.managers.group = createGroupManager(state);
	state.managers.navigation = createNavigationManager(state);
	state.managers.render = createRenderManager(state);
	state.managers.row = createRowManager(state);
	state.managers.selection = createSelectionManager(state);
	state.managers.sort = createSortManager(state);
	state.managers.style = createStyleManager(state);

	tabela.data = state.managers.data.handlers;
	tabela.events = state.managers.event.herald.events;
	tabela.filter = state.managers.filter.handlers;
	tabela.group = state.managers.group.handlers;
	tabela.selection = state.managers.selection.handlers;
	tabela.sort = state.managers.sort.handlers;

	table.append(
		state.components.header.elements.group,
		state.components.body.elements.group,
		state.components.footer.elements.group,
	);

	element.append(table);

	setColumns(state, options.columns);
	initializeNavigation(state);

	state.managers.data.set(options.data);

	return state;
}

function getId(): number {
	id += 1;

	return id;
}

// #endregion

// #region Variables

let id = 0;

// #endregion
