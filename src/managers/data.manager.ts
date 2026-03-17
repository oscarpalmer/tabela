import {chunk, select, sort} from '@oscarpalmer/atoms/array';
import {toMap} from '@oscarpalmer/atoms/array/to-map';
import {toRecord} from '@oscarpalmer/atoms/array/to-record';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {delay} from '@oscarpalmer/atoms/promise/delay';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import type {ColumnComponent} from '../components/column.component';
import {GroupComponent, updateGroup} from '../components/group.component';
import {getGroup, isGroupKey} from '../helpers/misc.helpers';
import type {DataState, DataValue, TabelaData} from '../models/data.model';
import {
	EVENT_DATA_ADD,
	EVENT_DATA_CLEAR,
	EVENT_DATA_REMOVE,
	EVENT_DATA_SYNCHRONIZE,
	EVENT_DATA_UPDATE,
	EVENT_GROUP_ADD,
	EVENT_GROUP_REMOVE,
	EVENT_GROUP_UPDATE,
} from '../models/event.model';
import {SORT_ASCENDING} from '../models/sort.model';
import type {State} from '../models/tabela.model';
import {sortWithGroups} from './sort.manager';

export class DataManager {
	handlers: TabelaData = {
		add: data => this.add(data, true),
		clear: () => this.clear(),
		get: active => this.get(active),
		remove: items => this.remove(items, true),
		synchronize: (data, remove) => this.synchronize(data, remove === true),
		update: data => this.update(data, true),
	};

	state: DataState;

	get keys(): Key[] {
		return this.state.keys.active ?? this.state.keys.original;
	}

	get size(): number {
		return this.keys.length;
	}

	constructor(state: State) {
		this.state = {
			...state,
			keys: {
				original: [],
			},
			values: {
				array: [],
				mapped: new Map(),
			},
		};
	}

	async add(data: PlainObject[], render: boolean): Promise<void> {
		const {state} = this;

		const addedData: PlainObject[] = [];
		const updatedData: PlainObject[] = [];

		const addedGroups: GroupComponent[] = [];
		const updatedGroups: GroupComponent[] = [];

		let groupColumn: ColumnComponent | undefined;
		let {length} = data;

		for (let index = 0; index < length; index += 1) {
			const item = data[index];
			const key = getValue(item, state.key) as Key;

			if (state.values.mapped.has(key)) {
				updatedData.push(item);

				continue;
			}

			addedData.push(item);

			state.values.array.push(item);
			state.values.mapped.set(key, item);

			if (!state.managers.group.enabled) {
				continue;
			}

			const groupValue = getValue(item, state.managers.group.key) as Key;

			let group = state.managers.group.getForValue(groupValue);

			if (group == null) {
				groupColumn ??= state.managers.column.get(state.managers.group.key);

				group = new GroupComponent(
					`${groupColumn?.options.label ?? state.managers.group.key}: ${groupValue}`,
					groupValue,
				);

				state.values.array.push(group.key);
				state.managers.group.add(group, false);

				addedGroups.push(group);
			} else if (!addedGroups.includes(group) && !updatedGroups.includes(group)) {
				updatedGroups.push(group);
			}

			if (!group.expanded) {
				state.managers.group.collapsed.add(key);
			}

			group.total += 1;
		}

		length = addedGroups.length;

		if (length > 0) {
			state.managers.event.emit(EVENT_GROUP_ADD, addedGroups.map(getGroup));

			for (let index = 0; index < length; index += 1) {
				updateGroup(state, addedGroups[index], false);
			}
		}

		length = updatedGroups.length;

		if (length > 0) {
			for (let index = 0; index < length; index += 1) {
				updateGroup(state, updatedGroups[index], false);
			}

			state.managers.event.emit(EVENT_GROUP_UPDATE, updatedGroups.map(getGroup));
		}

		await this.update(updatedData, addedData.length === 0);

		if (addedData.length === 0) {
			return;
		}

		state.managers.event.emit(EVENT_DATA_ADD, addedData);

		if (render) {
			this.render();
		}
	}

	async clear(): Promise<void> {
		if (this.state.values.array.length > 0) {
			return this.removeItems([], true, true).then(() => undefined);
		}
	}

	destroy(): void {
		const {state} = this;

		state.values.mapped.clear();

		state.keys.active = undefined;
		state.keys.original.length = 0;
		state.values.array.length = 0;

		this.handlers = undefined as never;
		this.state = undefined as never;
	}

	get(active?: boolean): PlainObject[] {
		const {state} = this;

		return (active ?? false) && state.keys.active != null
			? select(
					state.keys.active,
					key => !isGroupKey(key),
					key => state.values.mapped.get(key as Key)!,
				)
			: (state.values.array.filter(item => !isGroupKey(item)) as PlainObject[]);
	}

	getIndex(item: Key): number {
		return this.keys.indexOf(item);
	}

	async remove(items: Array<Key | PlainObject>, render: false): Promise<PlainObject[]>;

	async remove(items: Array<Key | PlainObject>, render: true): Promise<void>;

	async remove(items: Array<Key | PlainObject>, render: boolean): Promise<unknown> {
		const {state} = this;

		const keys = items
			.map(value => (isPlainObject(value) ? getValue(value, state.key) : value) as Key)
			.filter(key => !isGroupKey(key));

		const {length} = keys;

		return length === 0
			? render
				? undefined
				: []
			: this.removeItems(keys, false, render as never);
	}

	async removeItems(data: Key[], clear: boolean, render: false): Promise<PlainObject[]>;

	async removeItems(data: Key[], clear: boolean, render: true): Promise<void>;

	async removeItems(keys: Key[], clear: boolean, render: boolean): Promise<unknown> {
		const {state} = this;

		if (clear) {
			state.keys.active = undefined;
			state.keys.original = [];
			state.values.array = [];

			state.values.mapped.clear();

			state.managers.row.clear();

			if (state.managers.group.enabled) {
				state.managers.group.clear();
			}

			state.managers.event.emit(EVENT_DATA_CLEAR);

			this.render();

			return render ? undefined : [];
		}

		const removedGroups: GroupComponent[] = [];
		const updatedGroups: GroupComponent[] = [];

		const removedData: PlainObject[] = [];

		const chunked = chunk(keys);
		const chunkedLength = chunked.length;

		for (let chunkedIndex = 0; chunkedIndex < chunkedLength; chunkedIndex += 1) {
			const chunk = chunked[chunkedIndex];
			const chunkLength = chunk.length;

			for (let keyIndex = 0; keyIndex < chunkLength; keyIndex += 1) {
				const key = chunk[keyIndex];
				const dataIndex = state.keys.original.indexOf(key);

				let dataValue: PlainObject | undefined;

				[dataValue] = state.values.array.splice(dataIndex, 1) as PlainObject[];

				removedData.push(dataValue);

				state.keys.original.splice(dataIndex, 1);
				state.managers.row.remove(key as never);
				state.values.mapped.delete(key as Key);

				if (!state.managers.group.enabled || isGroupKey(key)) {
					continue;
				}

				state.managers.group.collapsed.delete(key as never);

				const groupValue = getValue(dataValue, state.managers.group.key) as unknown;

				const group = state.managers.group.getForValue(groupValue);

				if (group == null) {
					continue;
				}

				group.total -= 1;

				if (group.total > 0) {
					updatedGroups.push(group);

					continue;
				}

				let groupIndex = updatedGroups.indexOf(group);

				if (groupIndex > -1) {
					updatedGroups.splice(groupIndex, 1);
				}

				groupIndex = state.values.array.indexOf(group.key);

				if (groupIndex > -1) {
					state.keys.original.splice(groupIndex, 1);
					state.values.array.splice(groupIndex, 1);
				}

				removedGroups.push(group);

				state.managers.group.remove(group, false);

				if (keys.length >= 10_000) {
					await delay(25);
				}
			}
		}

		let {length} = updatedGroups;

		if (length > 0) {
			for (let index = 0; index < length; index += 1) {
				updateGroup(state, updatedGroups[index], false);
			}

			state.managers.event.emit(EVENT_GROUP_UPDATE, updatedGroups.map(getGroup));
		}

		length = removedGroups.length;

		if (length > 0) {
			state.managers.event.emit(EVENT_GROUP_REMOVE, removedGroups.map(getGroup));
		}

		state.managers.event.emit(EVENT_DATA_REMOVE, removedData);

		if (render) {
			this.render();
		}

		return render ? undefined : removedData;
	}

	render(): void {
		const {state} = this;

		if (state.managers.group.enabled) {
			sortWithGroups(state, state.values.array, [
				{
					direction: SORT_ASCENDING,
					key: state.key,
				},
			]);
		} else {
			sort(state.values.array as PlainObject[], [
				{
					direction: SORT_ASCENDING,
					key: state.key,
				},
			]);
		}

		state.keys.active = undefined;

		state.keys.original = state.values.array.map(item =>
			typeof item === 'string' ? item : (getValue(item, state.key) as Key),
		);

		state.values.mapped = toMap(
			state.values.array.filter(item => !isGroupKey(item)) as PlainObject[],
			item => getValue(item, state.key) as Key,
		);

		state.managers.render.render('data');
	}

	set(data: PlainObject[]): void {
		const {state} = this;

		const array: DataValue[] = data.slice();

		if (state.managers.group.enabled) {
			const column = state.managers.column.get(state.managers.group.key);

			const grouped = toRecord.arrays(data, state.managers.group.key) as Record<
				string,
				PlainObject[]
			>;

			const entries = Object.entries(grouped);
			const {length} = entries;

			const groups: GroupComponent[] = [];

			for (let index = 0; index < length; index += 1) {
				const [value, items] = entries[index];

				const group = new GroupComponent(
					`${column?.options.label ?? state.managers.group.key}: ${value}`,
					value,
				);

				group.total = items.length;

				groups.push(group);

				array.push(group.key);
			}

			state.managers.group.set(groups);
		}

		state.values.array = array;

		this.render();
	}

	async synchronize(data: PlainObject[], remove: boolean): Promise<void> {
		const {state} = this;

		const added: PlainObject[] = [];
		const updated: PlainObject[] = [];

		const keys = new Set<Key>([]);

		const {length} = data;

		for (let index = 0; index < length; index += 1) {
			const object = data[index];
			const key = getValue(object, state.key) as Key;

			if (state.values.mapped.has(key)) {
				updated.push(object);
			} else {
				added.push(object);
			}

			keys.add(key);
		}

		if (keys.size === 0) {
			return;
		}

		let removed: PlainObject[] = [];

		if (remove) {
			const toRemove = state.keys.original.filter(
				key => !isGroupKey(key) && !keys.has(key),
			) as Key[];

			if (toRemove.length > 0) {
				removed = await this.remove(toRemove, false);
			}
		}

		await this.update(updated, added.length === 0);

		await this.add(added, false);

		state.managers.event.emit(EVENT_DATA_SYNCHRONIZE, {
			added,
			removed,
			updated,
		});

		if (added.length > 0 || remove) {
			this.render();
		}
	}

	async update(data: PlainObject[], render: boolean): Promise<void> {
		const {state} = this;

		const {length} = data;

		const updated: PlainObject[] = [];

		for (let index = 0; index < length; index += 1) {
			const item = data[index];

			const key = getValue(item, state.key) as Key;

			const existing = state.keys.original.indexOf(key);

			if (existing === -1) {
				continue;
			}

			Object.assign(state.values.array[existing], item);

			updated.push(state.values.array[existing] as PlainObject);

			if (render && state.managers.render.visible.keys.has(key)) {
				state.managers.row.update(key);
			}
		}

		if (updated.length > 0) {
			state.managers.event.emit(EVENT_DATA_UPDATE, updated);
		}
	}
}
