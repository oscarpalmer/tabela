import {filter} from '@oscarpalmer/atoms/array/filter';
import {select} from '@oscarpalmer/atoms/array/select';
import {toRecord} from '@oscarpalmer/atoms/array/to-record';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {createGroup} from '../components/group.component';
import {getColumn} from '../helpers/column.helper';
import {addData} from '../helpers/data/data.add';
import {clearData, removeData} from '../helpers/data/data.remove';
import {renderData} from '../helpers/data/data.render';
import {synchronizeData} from '../helpers/data/data.synchronize';
import {updateData} from '../helpers/data/data.update';
import {isGroupKey, setGroups} from '../helpers/group.helper';
import type {DataManager, DataValue, TabelaData} from '../models/data.model';
import type {GroupComponent} from '../models/group.model';
import {SYMBOL, type State} from '../models/tabela.model';

// #region Instances

function DataManager(this: DataManager, state: State): void {
	this.state = state;

	this.data = {
		keys: {
			original: [],
		},
		values: {
			array: [],
			mapped: new Map(),
		},
	};

	// @ts-expect-error All good, no worries :-)
	this.handlers = new TabelaData(state);
}

DataManager.prototype.clear = clear;
DataManager.prototype.destroy = destroyDataManager;
DataManager.prototype.get = getData;
DataManager.prototype.getIndex = getIndex;
DataManager.prototype.set = setData;

Object.defineProperties(DataManager.prototype, {
	keys: {
		enumerable: true,
		get: getKeys,
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
	return this[SYMBOL].managers.data.clear();
}

export function createDataManager(state: State): DataManager {
	// @ts-expect-error All good, no worries :-)
	return new DataManager(state);
}

function destroyDataManager(this: DataManager): void {
	const {data} = this;

	data.values.mapped.clear();

	data.keys.active = undefined;
	data.keys.original.length = 0;
	data.values.array.length = 0;

	this.data = undefined as never;
	this.handlers = undefined as never;
	this.state = undefined as never;
}

function getData(this: DataManager, active?: boolean): PlainObject[] {
	const {data} = this;

	return (active ?? false) && data.keys.active != null
		? select(
				data.keys.active,
				key => !isGroupKey(key),
				key => data.values.mapped.get(key as Key)!,
			)
		: (filter.remove(data.values.array, isGroupKey) as PlainObject[]);
}

function getIndex(this: DataManager, item: Key): number {
	return this.keys.indexOf(item);
}

function getKeys(this: DataManager): Key[] {
	return this.data.keys.active ?? this.data.keys.original;
}

function getSize(this: DataManager): number {
	return this.keys.length;
}

function getTabelaData(this: TabelaData, active?: boolean): PlainObject[] {
	return this[SYMBOL].managers.data.get(active);
}

function removeTabelaData(this: TabelaData, keys: Key[]): Promise<void>;

function removeTabelaData(this: TabelaData, data: PlainObject[]): Promise<void>;

function removeTabelaData(this: TabelaData, value: Key[] | PlainObject[]): Promise<void> {
	return removeData(this[SYMBOL], value, true);
}

function setData(this: DataManager, data: PlainObject[]): void {
	const {state} = this;

	const array: DataValue[] = data.slice();

	if (state.managers.group.enabled) {
		const column = getColumn(state, state.managers.group.key);

		const grouped = toRecord.arrays(data, state.managers.group.key) as Record<
			string,
			PlainObject[]
		>;

		const entries = Object.entries(grouped);
		const {length} = entries;

		const groups: GroupComponent[] = [];

		for (let index = 0; index < length; index += 1) {
			const [value, items] = entries[index];

			const group = createGroup(
				`${column?.options.label ?? state.managers.group.key}: ${value}`,
				value,
			);

			group.total = items.length;

			groups.push(group);

			array.push(group.key.full);
		}

		setGroups(state, groups);
	}

	this.data.values.array = array;

	renderData(state);
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
