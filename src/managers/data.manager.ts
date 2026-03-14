import {chunk, select, sort} from '@oscarpalmer/atoms/array';
import {toMap} from '@oscarpalmer/atoms/array/to-map';
import {toRecord} from '@oscarpalmer/atoms/array/to-record';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {delay} from '@oscarpalmer/atoms/promise/delay';
import {getValue} from '@oscarpalmer/atoms/value/handle';
import {GroupComponent, updateGroup} from '../components/group.component';
import type {DataItem, DataState, TabelaData} from '../models/data.model';
import type {State} from '../models/tabela.model';
import {sortWithGroups} from './sort.manager';
import type {ColumnComponent} from '../components/column.component';

export class DataManager {
	handlers = Object.freeze({
		add: data => void this.add(data, true),
		clear: () => void this.clear(),
		get: active => this.get(active),
		remove: items => void this.remove(items, true),
		synchronize: (data, remove) => void this.synchronize(data, remove),
		update: data => void this.update(data),
	} satisfies TabelaData);

	state: DataState;

	get items(): DataItem[] {
		return this.state.items.active ?? this.state.items.original;
	}

	get size(): number {
		return this.items.length;
	}

	constructor(state: State) {
		this.state = {
			...state,
			items: {
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

		for (let index = 0; index < length; index += 1) {
			const item = data[index];
			const key = getValue(item, state.key) as Key;

			if (state.values.mapped.has(key)) {
				updates.push(item);

				continue;
			}

			state.values.array.push(item);
			state.values.mapped.set(key, item);

			if (!state.managers.group.enabled) {
				continue;
			}

			const groupValue = getValue(item, state.managers.group.field) as unknown;

			let group = state.managers.group.get(groupValue);

			if (group == null) {
				groupColumn ??= state.managers.column.get(state.managers.group.field);

				group = new GroupComponent(
					`${groupColumn?.options.title ?? state.managers.group.field}: ${groupValue}`,
					groupValue,
				);

				state.values.array.push(group);
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

		if (updates.length > 0) {
			void this.update(updates);
		} else if (render) {
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

		state.items.active = undefined;
		state.items.original.length = 0;
		state.values.array.length = 0;

		this.handlers = undefined as never;
		this.state = undefined as never;
	}

	get(active?: boolean): PlainObject[] {
		const {state} = this;

		return (active ?? false)
			? select(
					state.items.active ?? [],
					key => !(key instanceof GroupComponent),
					key => state.values.mapped.get(key as Key)!,
				)
			: (state.values.array.filter(item => !(item instanceof GroupComponent)) as PlainObject[]);
	}

	getIndex(item: DataItem): number {
		if (item instanceof GroupComponent) {
			return this.items.indexOf(item);
		}

		return this.items.findIndex(value =>
			value instanceof GroupComponent ? value.key === item : value === item,
		);
	}

	async remove(items: Array<Key | PlainObject>, render: boolean): Promise<void> {
		const {state} = this;

		const keys = items.map(
			value => (isPlainObject(value) ? getValue(value, state.key) : value) as Key,
		);

		const {length} = keys;

		if (length > 0) {
			return this.removeItems(keys, false, render === true);
		}
	}

	async removeItems(items: DataItem[], clear: boolean, render: boolean): Promise<void> {
		const {state} = this;

		if (clear) {
			state.items.active = undefined;
			state.items.original = [];
			state.values.array = [];

			state.values.mapped.clear();

			state.managers.row.clear();

			if (state.managers.group.enabled) {
				state.managers.group.clear();
			}

			return this.render();
		}

		const groups: GroupComponent[] = [];

		const chunked = chunk(items);
		const chunkedLength = chunked.length;

		for (let chunkedIndex = 0; chunkedIndex < chunkedLength; chunkedIndex += 1) {
			const chunk = chunked[chunkedIndex];
			const chunkLength = chunk.length;

			for (let itemIndex = 0; itemIndex < chunkLength; itemIndex += 1) {
				const item = chunk[itemIndex];
				const dataIndex = state.items.original.indexOf(item);

				let dataValue: PlainObject | undefined;

				[dataValue] = state.values.array.splice(dataIndex, 1) as PlainObject[];

				state.items.original.splice(dataIndex, 1);
				state.managers.row.remove(item as never);
				state.values.mapped.delete(item as Key);

				if (!state.managers.group.enabled || item instanceof GroupComponent) {
					continue;
				}

				state.managers.group.collapsed.delete(item as never);

				const groupKey = getValue(dataValue, state.managers.group.field) as unknown;

				const group = state.managers.group.get(groupKey);

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

				groupIndex = state.values.array.indexOf(group);

				if (groupIndex > -1) {
					state.items.original.splice(groupIndex, 1);
					state.values.array.splice(groupIndex, 1);
				}

				state.managers.group.remove(group);

				if (items.length >= 10_000) {
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
					direction: 'ascending',
					key: state.key,
				},
			]);
		} else {
			sort(state.values.array as PlainObject[], [
				{
					direction: 'ascending',
					key: state.key,
				},
			]);
		}

		state.items.original = state.values.array.map(item =>
			item instanceof GroupComponent ? item : (getValue(item, state.key) as Key),
		);

		state.values.mapped = toMap(
			state.values.array.filter(item => !(item instanceof GroupComponent)) as PlainObject[],
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

		const array: Array<GroupComponent | PlainObject> = data.slice();

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
					`${column?.options.title ?? state.managers.group.field}: ${value}`,
					value,
				);

				group.total = items.length;

				groups.push(group);

				array.push(group);
			}

			state.managers.group.set(groups);
		}

		state.values.array = array;

		this.render();
	}

	async synchronize(data: PlainObject[], remove?: boolean): Promise<void> {
		const {state} = this;

		const add: PlainObject[] = [];
		const updated: PlainObject[] = [];

		const keys = new Set<Key>([]);

		const {length} = data;

		for (let index = 0; index < length; index += 1) {
			const object = data[index];
			const key = getValue(object, state.key) as Key;

			if (state.values.mapped.has(key)) {
				updated.push(object);
			} else {
				add.push(object);
			}

			keys.add(key);
		}

		if (keys.size === 0) {
			return;
		}

		if (remove ?? false) {
			const toRemove = state.items.original.filter(
				key => !(key instanceof GroupComponent) && !keys.has(key),
			) as Key[];

			if (toRemove.length > 0) {
				await this.remove(toRemove, false);
			}
		}

		await this.update(updated);

		if (add.length > 0) {
			await this.add(add, false);
		}

		if (add.length > 0 || (remove ?? false)) {
			this.render();
		}
	}

	async update(data: PlainObject[]): Promise<void> {
		const {state} = this;

		const {length} = data;

		for (let index = 0; index < length; index += 1) {
			const object = data[index];

			const key = getValue(object, state.key) as Key;
			const value = state.values.mapped.get(key);

			if (value != null) {
				state.values.mapped.set(key, {...value, ...object} as PlainObject);

				state.managers.row.update(key);
			}
		}
	}
}
