import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
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
import type {FilterItem} from './filter.model';
import type {SortDirection, SortItem} from './sort.model';
import type {TabelaOptions} from './tabela.options';

export type TabelaComponents = {
	body: BodyComponent;
	footer: FooterComponent;
	header: HeaderComponent;
};

export type TabelaData = {
	add(data: PlainObject[]): void;
	clear(): void;
	get(active?: boolean): PlainObject[];
	remove(keys: Key[]): void;
	remove(data: PlainObject[]): void;
	synchronize(data: PlainObject[], remove?: boolean): void;
	update(data: PlainObject[]): void;
};

export type TabelaFilter = {
	add(item: FilterItem): void;
	clear(): void;
	remove(field: string): void;
	remove(item: FilterItem): void;
	set(items: FilterItem[]): void;
};

export type TabelaManagers = {
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

export type TabelaSelection = {
	clear(): void;
	deselect(keys: Key[]): void;
	select(keys: Key[]): void;
	toggle(): void;
};

export type TabelaSort = {
	add(field: string, direction?: SortDirection): void;
	clear(): void;
	flip(field: string): void;
	remove(field: string): void;
	set(items: SortItem[]): void;
};

export type TabelaState = {
	readonly components: TabelaComponents;
	readonly element: HTMLElement;
	readonly id: number;
	readonly key: string;
	readonly managers: TabelaManagers;
	readonly options: TabelaOptions;
};
