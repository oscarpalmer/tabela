import {select, sort} from '@oscarpalmer/atoms/array';
import {toMap} from '@oscarpalmer/atoms/array/to-map';
import {toRecord} from '@oscarpalmer/atoms/array/to-record';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import type {DataValues, TabelaData} from '../models/data.model';
import type {State} from '../models/tabela.model';
import {GroupComponent} from '../components/group.component';
import {sortWithGroups} from './sort.manager';
import {isPlainObject} from '@oscarpalmer/atoms/is';

export class DataManager {
	handlers = Object.freeze({
		add: data => void this.add(data, true),
		clear: () => void this.clear(),
		get: active => this.get(active),
		remove: items => void this.remove(items, true),
		synchronize: (data, remove) => void this.synchronize(data, remove),
		update: data => void this.update(data),
	} satisfies TabelaData);

	values: DataValues = {
		keys: {
			original: [],
		},
		objects: {
			mapped: new Map(),
			array: [],
		},
	};

	get keys(): Array<GroupComponent | Key> {
		return this.values.keys.active ?? this.values.keys.original;
	}

	get size(): number {
		return this.keys.length;
	}

	constructor(public state: State) {}

	async add(data: PlainObject[], render: boolean): Promise<void> {
		const {state, values} = this;
		const {length} = data;

		const updates: PlainObject[] = [];

		for (let index = 0; index < length; index += 1) {
			const item = data[index];
			const key = item[state.key] as Key;

			if (values.objects.mapped.has(key)) {
				updates.push(item);

				continue;
			}

			values.objects.array.push(item);
			values.objects.mapped.set(key, item);

			if (!state.managers.group.enabled) {
				continue;
			}

			const groupKey = item[state.managers.group.field] as unknown;

			let group = state.managers.group.get(groupKey);

			if (group == null) {
				group = new GroupComponent(String(groupKey), String(groupKey), groupKey);

				values.objects.array.push(group);

				state.managers.group.add(group);
			}

			if (!group.expanded) {
				state.managers.group.collapsed.add(key);
			}

			group.total += 1;
		}

		if (updates.length > 0) {
			void this.update(updates);
		} else if (render) {
			this.render();
		}
	}

	clear(): void {
		if (this.values.objects.array.length > 0) {
			this.set([]);
		}
	}

	destroy(): void {
		const {values} = this;

		values.objects.mapped.clear();

		values.keys.active = undefined;
		values.keys.original.length = 0;
		values.objects.array.length = 0;

		this.handlers = undefined as never;
		this.state = undefined as never;
		this.values = undefined as never;
	}

	get(active?: boolean): PlainObject[] {
		const {values} = this;

		return (active ?? false)
			? select(
					values.keys.active ?? [],
					key => !(key instanceof GroupComponent),
					key => values.objects.mapped.get(key as Key)!,
				)
			: (values.objects.array.filter(item => !(item instanceof GroupComponent)) as PlainObject[]);
	}

	getIndex(key: Key): number {
		return this.keys.indexOf(key);
	}

	async remove(items: Array<Key | PlainObject>, render: boolean): Promise<void> {
		const {state, values} = this;

		const keys = items
			.map(value => (isPlainObject(value) ? value[state.key] : value) as Key)
			.filter(key => values.objects.mapped.has(key)) as Key[];

		const {length} = keys;

		if (length === 0) {
			return;
		}

		for (let keyIndex = 0; keyIndex < length; keyIndex += 1) {
			const key = keys[keyIndex];

			values.objects.mapped.delete(key);

			const arrayIndex = values.objects.array.findIndex(
				item => !(item instanceof GroupComponent) && item[state.key] === key,
			);

			let item: PlainObject | undefined;

			if (arrayIndex > -1) {
				[item] = values.objects.array.splice(arrayIndex, 1) as PlainObject[];
			}

			values.keys.original.splice(values.keys.original.indexOf(key), 1);

			state.managers.row.remove(key);

			if (!state.managers.group.enabled || item == null) {
				continue;
			}

			state.managers.group.collapsed.delete(key);

			const groupKey = item[state.managers.group.field] as unknown;

			const group = state.managers.group.get(groupKey);

			if (group == null) {
				continue;
			}

			group.total -= 1;

			if (group.total > 0) {
				continue;
			}

			const groupIndex = values.objects.array.findIndex(
				item => item instanceof GroupComponent && item.value === groupKey,
			);

			if (groupIndex > -1) {
				values.objects.array.splice(groupIndex, 1);
			}

			state.managers.group.remove(group);
		}

		if (render) {
			this.render();
		}
	}

	render(): void {
		const {state, values} = this;

		if (state.managers.group.enabled) {
			sortWithGroups(state, values.objects.array, [
				{
					direction: 'ascending',
					key: state.key,
				},
			]);
		} else {
			sort(values.objects.array as PlainObject[], [
				{
					direction: 'ascending',
					key: state.key,
				},
			]);
		}

		values.keys.original = values.objects.array.map(item =>
			item instanceof GroupComponent ? item : (item[state.key] as Key),
		);

		values.objects.mapped = toMap(
			values.objects.array.filter(item => !(item instanceof GroupComponent)) as PlainObject[],
			item => item[state.key] as Key,
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
		const {state, values} = this;

		const array: Array<GroupComponent | PlainObject> = data.slice();

		if (state.managers.group.enabled) {
			const grouped = toRecord.arrays(data, state.managers.group.field) as Record<
				string,
				PlainObject[]
			>;

			const entries = Object.entries(grouped);
			const {length} = entries;

			const groups: GroupComponent[] = [];

			for (let index = 0; index < length; index += 1) {
				const [value, items] = entries[index];

				const key = String(value);

				const group = new GroupComponent(key, key, value);

				group.total = items.length;

				groups.push(group);

				array.push(group);
			}

			state.managers.group.set(groups);
		}

		values.objects.array = array;

		this.render();
	}

	async synchronize(data: PlainObject[], remove?: boolean): Promise<void> {
		const {state, values} = this;

		const add: PlainObject[] = [];
		const updated: PlainObject[] = [];

		const keys = new Set<Key>([]);

		const {length} = data;

		for (let index = 0; index < length; index += 1) {
			const object = data[index];
			const key = object[state.key] as Key;

			if (values.objects.mapped.has(key)) {
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
			const toRemove = values.keys.original.filter(
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
		const {state, values} = this;

		const {length} = data;

		for (let index = 0; index < length; index += 1) {
			const object = data[index];
			const key = object[state.key] as Key;
			const value = values.objects.mapped.get(key);

			if (value != null) {
				values.objects.mapped.set(key, {...value, ...object} as PlainObject);

				state.managers.row.update(key);
			}
		}
	}
}
