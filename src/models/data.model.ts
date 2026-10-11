import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import type {State, SYMBOL} from './tabela.model';

// #region Types

type DataKeys = {
	active?: Key[];
	original: Key[];
};

export type DataManager = {
	data: DataManagerData;
	handlers: TabelaData;
	state: State;
	get keys(): Key[];
	get size(): number;
	clear(): Promise<void>;
	destroy(): void;
	get(active?: boolean): PlainObject[];
	getIndex(item: Key): number;
	set(data: PlainObject[]): void;
};

type DataManagerData = {
	keys: DataKeys;
	values: DataValues;
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
