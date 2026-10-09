import type {HeraldEvents} from '@oscarpalmer/atoms/herald';
import type {BodyComponent} from './body.model';
import type {ColumnManager} from './column.model';
import type {DataManager, TabelaData} from './data.model';
import type {EventManager, EventMap} from './event.model';
import type {FilterManager, TabelaFilter} from './filter.model';
import type {FooterComponent} from './footer.model';
import type {GroupManager, TabelaGroup} from './group.model';
import type {HeaderComponent} from './header.model';
import type {NavigationManager} from './navigation.model';
import type {RenderManager} from './render.model';
import type {RowManager} from './row.model';
import type {SelectionManager, TabelaSelection} from './selection.model';
import type {SortManager, TabelaSort} from './sort.model';
import type {StyleManager} from './style.model';
import type {TabelaOptions} from './options.model';

// #region Types

type Components = {
	body: BodyComponent;
	footer: FooterComponent;
	header: HeaderComponent;
};

type Managers = {
	column: ColumnManager;
	data: DataManager;
	event: EventManager;
	filter: FilterManager;
	group: GroupManager;
	navigation: NavigationManager;
	render: RenderManager;
	row: RowManager;
	selection: SelectionManager;
	sort: SortManager;
	style: StyleManager;
};

export type State = {
	components: Components;
	elements: StateElements;
	id: number;
	key: string;
	managers: Managers;
	prefix: string;
	options: TabelaOptions;
};

type StateElements = {
	table: HTMLDivElement;
	wrapper: HTMLElement;
};

export type Tabela = {
	[SYMBOL]: State;
	data: TabelaData;
	events: HeraldEvents<EventMap>;
	filter: TabelaFilter;
	group: TabelaGroup;
	selection: TabelaSelection;
	sort: TabelaSort;
};

// #endregion

// #region Variables

export const SYMBOL: unique symbol = Symbol('tabela');

// #endregion
