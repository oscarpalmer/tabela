import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import type {State, SYMBOL} from './tabela.model';

// #region Types

export type DataManager = {
	handlers: TabelaData;
	state: State;
	store: DataManagerStore;
	get keys(): Key[];
	get rows(): Key[];
	get size(): number;
	destroy(): void;
};

type DataManagerStore = {
	keys: DataManagerDataKeys;
	values: DataValues;
};

type DataManagerDataKeys = {
	all: DataManagerDataKeysValue;
	row: DataManagerDataKeysValue;
};

type DataManagerDataKeysValue = {
	active?: Key[];
	original: Key[];
};

export type DataUpdate = 'add' | 'set' | 'remove' | 'update';

export type DataValue = string | PlainObject;

type DataValues = {
	array: DataValue[];
	mapped: Map<Key, PlainObject>;
};

export type TabelaData = {
	[SYMBOL]: State;
	add(data: PlainObject[]): Promise<void>;
	clear(): Promise<void>;
	get(active?: boolean): PlainObject[];
	remove(keys: Key[]): Promise<void>;
	remove(data: PlainObject[]): Promise<void>;
	set(data: PlainObject[]): Promise<void>;
	synchronize(data: PlainObject[], remove?: boolean): Promise<void>;
	update(data: PlainObject[]): Promise<void>;
};

// #endregion

// #region Variables

export const DATA_UPDATE_ADD: DataUpdate = 'add';

export const DATA_UPDATE_SET: DataUpdate = 'set';

export const DATA_UPDATE_REMOVE: DataUpdate = 'remove';

export const DATA_UPDATE_UPDATE: DataUpdate = 'update';

// #endregion
