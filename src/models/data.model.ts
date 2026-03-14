import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import type {GroupComponent} from '../components/group.component';
import type {State} from './tabela.model';

export type DataItem = GroupComponent | Key;

type DataItems = {
	active?: Array<DataItem>;
	original: Array<DataItem>;
};

export type DataState = {
	items: DataItems;
	values: DataValues;
} & State;

type DataValues = {
	array: Array<GroupComponent | PlainObject>;
	mapped: Map<Key, PlainObject>;
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
