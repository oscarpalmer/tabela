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
