import type {BodyComponent} from '../components/body.component';
import type {FooterComponent} from '../components/footer.component';
import type {HeaderComponent} from '../components/header.component';
import type {ColumnManager} from '../managers/column.manager';
import type {DataManager} from '../managers/data.manager';
import type {EventManager} from '../managers/event.manager';
import type {FilterManager} from '../managers/filter.manager';
import type {GroupManager} from '../managers/group.manager';
import type {NavigationManager} from '../managers/navigation.manager';
import type {RenderManager} from '../managers/render.manager';
import type {RowManager} from '../managers/row.manager';
import type {SelectionManager} from '../managers/selection.manager';
import type {SortManager} from '../managers/sort.manager';
import type {StyleManager} from '../managers/style.manager';
import type {TabelaOptions} from './tabela.options';

export type Components = {
	body: BodyComponent;
	footer: FooterComponent;
	header: HeaderComponent;
};

export type Managers = {
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
	element: HTMLElement;
	id: number;
	key: string;
	managers: Managers;
	prefix: string;
	options: TabelaOptions;
};
