import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {addData} from '../helpers/data/data.add';
import {getData, setData} from '../helpers/data/data.misc';
import {clearData, removeData} from '../helpers/data/data.remove';
import {synchronizeData} from '../helpers/data/data.synchronize';
import {updateData} from '../helpers/data/data.update';
import type {DataManager, TabelaData} from '../models/data.model';
import {SYMBOL, type State} from '../models/tabela.model';

// #region Instances

function DataManager(this: DataManager, state: State): void {
	this.state = state;

	this.data = {
		keys: {
			all: {
				original: [],
			},
			row: {
				original: [],
			},
		},
		values: {
			array: [],
			mapped: new Map(),
		},
	};

	// @ts-expect-error All good, no worries :-)
	this.handlers = new TabelaData(state);
}

DataManager.prototype.destroy = destroyDataManager;

Object.defineProperties(DataManager.prototype, {
	keys: {
		enumerable: true,
		get: getKeys,
	},
	rows: {
		enumerable: true,
		get: getRows,
	},
	size: {
		enumerable: true,
		get: getSize,
	},
});

function TabelaData(this: TabelaData, state: State): void {
	this[SYMBOL] = state;
}

TabelaData.prototype.add = addTabelaData;
TabelaData.prototype.clear = clearTabelaData;
TabelaData.prototype.get = getTabelaData;
TabelaData.prototype.remove = removeTabelaData;
TabelaData.prototype.set = setTabelaData;
TabelaData.prototype.synchronize = synchronizeTabelaData;
TabelaData.prototype.update = updateTabelaData;

// #endregion

// #region Functions

async function addTabelaData(this: TabelaData, data: PlainObject[]): Promise<void> {
	return addData(this[SYMBOL], data, true);
}

async function clear(this: DataManager): Promise<void> {
	if (this.data.values.array.length > 0) {
		return clearData(this.state, false);
	}
}

async function clearTabelaData(this: TabelaData): Promise<void> {
	return clear.call(this[SYMBOL].managers.data);
}

export function createDataManager(state: State): DataManager {
	// @ts-expect-error All good, no worries :-)
	return new DataManager(state);
}

function destroyDataManager(this: DataManager): void {
	const {data} = this;

	data.keys.all = {original: []};
	data.keys.row = {original: []};

	data.values.array.length = 0;
	data.values.mapped.clear();

	this.data = undefined as never;
	this.handlers = undefined as never;
	this.state = undefined as never;
}

function getKeys(this: DataManager): Key[] {
	return this.data.keys.all.active ?? this.data.keys.all.original;
}

function getRows(this: DataManager): Key[] {
	return this.data.keys.row.active ?? this.data.keys.row.original;
}

function getSize(this: DataManager): number {
	return this.keys.length;
}

function getTabelaData(this: TabelaData, active?: boolean): PlainObject[] {
	return getData(this[SYMBOL], active);
}

function removeTabelaData(this: TabelaData, keys: Key[]): Promise<void>;

function removeTabelaData(this: TabelaData, data: PlainObject[]): Promise<void>;

function removeTabelaData(this: TabelaData, value: Key[] | PlainObject[]): Promise<void> {
	return removeData(this[SYMBOL], value, true);
}

function setTabelaData(this: TabelaData, data: PlainObject[]): Promise<void> {
	return setData(this[SYMBOL], data);
}

function synchronizeTabelaData(
	this: TabelaData,
	data: PlainObject[],
	remove?: boolean,
): Promise<void> {
	return synchronizeData(this[SYMBOL], data, remove === true);
}

function updateTabelaData(this: TabelaData, data: PlainObject[]): Promise<void> {
	return updateData(this[SYMBOL], data, true);
}

// #endregion
