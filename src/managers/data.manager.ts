import {chunk, select, sort} from '@oscarpalmer/atoms/array';
import {toMap} from '@oscarpalmer/atoms/array/to-map';
import {toRecord} from '@oscarpalmer/atoms/array/to-record';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {delay} from '@oscarpalmer/atoms/promise/delay';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import type {ColumnComponent} from '../components/column.component';
import {GroupComponent, updateGroup} from '../components/group.component';
import type {DataState, DataValue, TabelaData} from '../models/data.model';
import {SORT_ASCENDING} from '../models/sort.model';
import type {State} from '../models/tabela.model';
import {sortWithGroups} from './sort.manager';
import {isGroupKey} from '../helpers/misc.helpers';

export class DataManager {
	handlers: TabelaData = {
		add: data => void this.add(data, true),
		clear: () => this.clear(),
		get: active => this.get(active),
		remove: items => void this.remove(items, true),
		synchronize: (data, remove) => void this.synchronize(data, remove === true),
		update: data => void this.update(data, true),
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

		const groups: GroupComponent[] = [];
		const updates: PlainObject[] = [];

		let groupColumn: ColumnComponent | undefined;
		let {length} = data;

		let added = 0;

		for (let index = 0; index < length; index += 1) {
			const item = data[index];
			const key = getValue(item, state.key) as Key;

			if (state.values.mapped.has(key)) {
				updates.push(item);

				continue;
			}

			state.values.array.push(item);
			state.values.mapped.set(key, item);

			added += 1;

			if (!state.managers.group.enabled) {
				continue;
			}

			const groupValue = getValue(item, state.managers.group.field) as Key;

			let group = state.managers.group.getForValue(groupValue);

			if (group == null) {
				groupColumn ??= state.managers.column.get(state.managers.group.field);

				group = new GroupComponent(
					`${groupColumn?.options.label ?? state.managers.group.field}: ${groupValue}`,
					groupValue,
				);

				state.values.array.push(group.key);
				state.managers.group.add(group);
			}

			if (!group.expanded) {
				state.managers.group.collapsed.add(key);
			}

			group.total += 1;

			groups.push(group);
		}

		length = groups.length;

		for (let index = 0; index < length; index += 1) {
			updateGroup(state, groups[index]);
		}

		await this.update(updates, added === 0);

		if (added > 0 && render) {
			this.render();
		}
	}

	clear(): void {
		if (this.state.values.array.length > 0) {
			void this.removeItems([], true, true);
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

		return (active ?? false)
			? select(
					state.keys.active ?? [],
					key => !isGroupKey(key),
					key => state.values.mapped.get(key as Key)!,
				)
			: (state.values.array.filter(item => !isGroupKey(item)) as PlainObject[]);
	}

	getIndex(item: Key): number {
		return this.keys.indexOf(item);
	}

	async remove(items: Array<Key | PlainObject>, render: boolean): Promise<void> {
		const {state} = this;

		const keys = items
			.map(value => (isPlainObject(value) ? getValue(value, state.key) : value) as Key)
			.filter(key => !isGroupKey(key));

		const {length} = keys;

		if (length > 0) {
			return this.removeItems(keys, false, render === true);
		}
	}

	async removeItems(keys: Key[], clear: boolean, render: boolean): Promise<void> {
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

			return this.render();
		}

		const groups: GroupComponent[] = [];

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

				state.keys.original.splice(dataIndex, 1);
				state.managers.row.remove(key as never);
				state.values.mapped.delete(key as Key);

				if (!state.managers.group.enabled || isGroupKey(key)) {
					continue;
				}

				state.managers.group.collapsed.delete(key as never);

				const groupValue = getValue(dataValue, state.managers.group.field) as unknown;

				const group = state.managers.group.getForValue(groupValue);

				if (group == null) {
					continue;
				}

				group.total -= 1;

				if (group.total > 0) {
					groups.push(group);

					continue;
				}

				let groupIndex = groups.indexOf(group);

				if (groupIndex > -1) {
					groups.splice(groupIndex, 1);
				}

				groupIndex = state.values.array.indexOf(group.key);

				if (groupIndex > -1) {
					state.keys.original.splice(groupIndex, 1);
					state.values.array.splice(groupIndex, 1);
				}

				state.managers.group.remove(group);

				if (keys.length >= 10_000) {
					await delay(25);
				}
			}
		}

		const {length} = groups;

		for (let index = 0; index < length; index += 1) {
			updateGroup(state, groups[index]);
		}

		if (render) {
			return this.render();
		}
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

		state.keys.original = state.values.array.map(item =>
			typeof item === 'string' ? item : (getValue(item, state.key) as Key),
		);

		state.values.mapped = toMap(
			state.values.array.filter(item => !isGroupKey(item)) as PlainObject[],
			item => getValue(item, state.key) as Key,
		);

		if (Object.keys(state.managers.filter.items).length > 0) {
			state.managers.filter.filter();
		} else if (state.managers.sort.items.length > 0) {
			state.managers.sort.sort();
		} else {
			state.managers.render.update(true, true);
		}
	}

	set(data: PlainObject[]): void {
		const {state} = this;

		const array: DataValue[] = data.slice();

		if (state.managers.group.enabled) {
			const column = state.managers.column.get(state.managers.group.field);

			const grouped = toRecord.arrays(data, state.managers.group.field) as Record<
				string,
				PlainObject[]
			>;

			const entries = Object.entries(grouped);
			const {length} = entries;

			const groups: GroupComponent[] = [];

			for (let index = 0; index < length; index += 1) {
				const [value, items] = entries[index];

				const group = new GroupComponent(
					`${column?.options.label ?? state.managers.group.field}: ${value}`,
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

		if (remove) {
			const toRemove = state.keys.original.filter(
				key => !isGroupKey(key) && !keys.has(key),
			) as Key[];

			if (toRemove.length > 0) {
				await this.remove(toRemove, false);
			}
		}

		await this.update(updated, added.length === 0);

		await this.add(added, false);

		if (added.length > 0 || remove) {
			this.render();
		}
	}

	async update(data: PlainObject[], render: boolean): Promise<void> {
		const {state} = this;

		const {length} = data;

		for (let dataIndex = 0; dataIndex < length; dataIndex += 1) {
			const dataItem = data[dataIndex];

			const key = getValue(dataItem, state.key) as Key;

			const keyIndex = state.keys.original.indexOf(key);

			if (keyIndex === -1) {
				continue;
			}

			Object.assign(state.values.array[keyIndex], dataItem);

			if (render) {
				state.managers.row.update(key);
			}
		}
	}
}
