import {toMap} from '@oscarpalmer/atoms/array/to-map';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import type {DataValues} from '../models/data.model';
import type {Tabela} from '../tabela';

export class DataManager {
	readonly values: DataValues;

	get length(): number {
		return this.values.keys.active?.length ?? this.values.keys.original.length;
	}

	constructor(
		readonly tabela: Tabela,
		values: PlainObject[],
	) {
		const mapped = toMap(values, tabela.key) as Map<Key, PlainObject>;

		this.values = {
			keys: {
				original: [...mapped.keys()],
			},
			objects: {
				mapped,
				array: values,
			},
		};
	}

	destroy(): void {
		const {values} = this;

		values.objects.mapped.clear();

		values.keys.active = undefined;
		values.keys.original.length = 0;
		values.objects.array.length = 0;
	}

	update(): void {
		this.tabela.components.body.elements.faker.style.height = `${this.length * this.tabela.managers.rows.height}px`;

		this.tabela.managers.virtualization.update(true);
	}
}
