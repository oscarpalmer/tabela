import type {Key, PlainObject} from '@oscarpalmer/atoms/models';

export type DataValues = {
	keys: DataValuesKeys;
	objects: DataValuesObjects;
};

type DataValuesKeys = {
	active?: Key[];
	original: Key[];
};

type DataValuesObjects = {
	array: PlainObject[];
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
