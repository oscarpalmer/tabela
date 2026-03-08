import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import type {GroupComponent} from '../components/group.component';

export type DataValues = {
	keys: DataValuesKeys;
	objects: DataValuesObjects;
};

type DataValuesKeys = {
	active?: Array<GroupComponent | Key>;
	original: Array<GroupComponent | Key>;
};

type DataValuesObjects = {
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
