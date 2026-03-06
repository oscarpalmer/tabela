import {toMap} from '@oscarpalmer/atoms/array/to-map';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import type {DataValues} from '../models/data.model';
import type {TabelaComponents, TabelaData, TabelaManagers} from '../models/tabela.model';

export class DataManager {
	readonly handlers: TabelaData = Object.freeze({
		add: data => void this.add(data, true),
		clear: () => void this.clear(),
		get: active => this.get(active),
		remove: items => void this.remove(items, true),
		synchronize: (data, remove) => void this.synchronize(data, remove),
		update: data => void this.update(data),
	});

	readonly values: DataValues = {
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

	constructor(
		public managers: TabelaManagers,
		public components: TabelaComponents,
		public field: string,
	) {}

	async add(data: PlainObject[], render: boolean): Promise<void> {
		const {field, values} = this;

		values.objects.array.push(...data);

		values.objects.mapped = toMap(values.objects.array, field) as Map<Key, PlainObject>;

		values.keys.original = [...values.objects.mapped.keys()];

		if (render) {
			this.managers.virtualization.update(true);
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
	}

	get(active?: boolean): PlainObject[] {
		const {values} = this;

		return (active ?? false)
			? (values.keys.active?.map(key => values.objects.mapped.get(key) as PlainObject) ?? [])
			: values.objects.array;
	}

	async remove(items: Array<Key | PlainObject>, render: boolean): Promise<void> {
		const {field, managers, values} = this;

		const keys = items
			.map(value => (isPlainObject(value) ? value[field] : value) as Key)
			.filter(key => values.objects.mapped.has(key)) as Key[];

		const {length} = keys;

		if (length === 0) {
			return;
		}

		for (let keyIndex = 0; keyIndex < length; keyIndex += 1) {
			const key = keys[keyIndex];

			values.objects.mapped.delete(key);

			const arrayIndex = values.objects.array.findIndex(object => object[field] === key);

			if (arrayIndex > -1) {
				values.objects.array.splice(arrayIndex, 1);
			}

			values.keys.original.splice(values.keys.original.indexOf(key), 1);

			managers.row.remove(key);
		}

		if (render) {
			this.managers.virtualization.update(true);
		}
	}

	set(data: PlainObject[]): void {
		const {field, values} = this;

		const mapped = toMap(data, field) as Map<Key, PlainObject>;

		values.keys.active = undefined;
		values.keys.original = [...mapped.keys()];

		values.objects.mapped = mapped;
		values.objects.array = data;

		this.managers.virtualization.update(true);
	}

	async synchronize(data: PlainObject[], remove?: boolean): Promise<void> {
		const {field, values} = this;

		const add: PlainObject[] = [];
		const updated: PlainObject[] = [];

		const keys = new Set<Key>([]);

		const {length} = data;

		for (let index = 0; index < length; index += 1) {
			const object = data[index];
			const key = object[field] as Key;

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
			this.managers.virtualization.update(true);
		}
	}

	async update(data: PlainObject[]): Promise<void> {
		const {field, managers, values} = this;

		const {length} = data;

		for (let index = 0; index < length; index += 1) {
			const object = data[index];
			const key = object[field] as Key;
			const value = values.objects.mapped.get(key);

			if (value != null) {
				values.objects.mapped.set(key, {...value, ...object} as PlainObject);

				managers.row.update(key);
			}
		}
	}
}
