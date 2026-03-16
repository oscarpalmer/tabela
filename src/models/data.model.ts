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
	add(data: PlainObject[]): void;
	clear(): void;
	get(active?: boolean): PlainObject[];
	remove(keys: Key[]): void;
	remove(data: PlainObject[]): void;
	synchronize(data: PlainObject[], remove?: boolean): void;
	update(data: PlainObject[]): void;
};
