import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import type {State} from './tabela.model';

type DataKeys = {
	active?: Key[];
	original: Key[];
};

export type DataState = {
	keys: DataKeys;
	values: DataValues;
} & State;

export type DataValue = string | PlainObject;

type DataValues = {
	array: DataValue[];
	mapped: Map<Key, PlainObject>;
};

export type TabelaData = {
	add(data: PlainObject[]): Promise<void>;
	clear(): Promise<void>;
	get(active?: boolean): PlainObject[];
	remove(keys: Key[]): Promise<void>;
	remove(data: PlainObject[]): Promise<void>;
	synchronize(data: PlainObject[], remove?: boolean): Promise<void>;
	update(data: PlainObject[]): Promise<void>;
};
