import {push, sort} from '@oscarpalmer/atoms/array';
import {toMap} from '@oscarpalmer/atoms/array/to-map';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import type {DataValues, TabelaData} from '../models/data.model';
import type {State} from '../models/tabela.model';

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

	get size(): number {
		return this.values.keys.active?.length ?? this.values.keys.original.length;
	}

	constructor(public state: State) {}

	async add(data: PlainObject[], render: boolean): Promise<void> {
		const {state, values} = this;

		push(values.objects.array, data);

		values.objects.mapped = toMap(values.objects.array, state.key) as Map<Key, PlainObject>;

		if (render) {
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
			? (values.keys.active?.map(key => values.objects.mapped.get(key) as PlainObject) ?? [])
			: values.objects.array;
	}

	getIndex(key: Key): number {
		const {values} = this;

		return (values.keys.active ?? values.keys.original).indexOf(key);
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

			const arrayIndex = values.objects.array.findIndex(object => object[state.key] === key);

			if (arrayIndex > -1) {
				values.objects.array.splice(arrayIndex, 1);
			}

			values.keys.original.splice(values.keys.original.indexOf(key), 1);

			state.managers.row.remove(key);
		}

		if (render) {
			this.render();
		}
	}

	render(): void {
		const {state, values} = this;

		values.keys.original = sort(values.objects.array.map(item => item[state.key] as Key));

		if (Object.keys(state.managers.filter.items).length > 0) {
			state.managers.filter.filter();
		} else if (state.managers.sort.items.length > 0) {
			state.managers.sort.sort();
		} else {
			state.managers.render.update(true);
		}
	}

	set(data: PlainObject[]): void {
		const {state, values} = this;

		values.objects.mapped = toMap(data, state.key) as Map<Key, PlainObject>;
		values.objects.array = data;

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
			const toRemove = values.keys.original.filter(key => !keys.has(key));

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
