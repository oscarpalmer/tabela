import type {BodyComponent} from '../components/body.component';
import type {FooterComponent} from '../components/footer.component';
import type {HeaderComponent} from '../components/header.component';
import type {ColumnManager} from '../managers/column.manager';
import type {DataManager} from '../managers/data.manager';
import type {EventManager} from '../managers/event.manager';
import type {FilterManager} from '../managers/filter.manager';
import type {NavigationManager} from '../managers/navigation.manager';
import type {RenderManager} from '../managers/render.manager';
import type {RowManager} from '../managers/row.manager';
import type {SelectionManager} from '../managers/selection.manager';
import type {SortManager} from '../managers/sort.manager';
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
	navigation: NavigationManager;
	row: RowManager;
	selection: SelectionManager;
	sort: SortManager;
	render: RenderManager;
};

export type State = {
	readonly components: Components;
	readonly element: HTMLElement;
	readonly id: number;
	readonly key: string;
	readonly managers: Managers;
	readonly options: TabelaOptions;
};
