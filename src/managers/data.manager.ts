import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import type {Tabela} from '../tabela';
import {VirtualizationManager} from './virtualization.manager';
import {toMap} from '@oscarpalmer/atoms/array';

type Keys = {
	active?: Key[];
	original: Key[];
};

type Objects = {
	array: PlainObject[];
	mapped: Map<Key, PlainObject>;
};

type Values = {
	keys: Keys;
	objects: Objects;
};

export class DataManager {
	readonly values: Values;

	readonly virtualization: VirtualizationManager;

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

		this.virtualization = new VirtualizationManager(tabela);
	}

	destroy(): void {
		const {values, virtualization} = this;

		virtualization.destroy();

		values.objects.mapped.clear();

		values.keys.active = undefined;
		values.keys.original.length = 0;
		values.objects.array.length = 0;
	}

	update(): void {
		this.tabela.components.body.elements.faker.style.height = `${this.length * this.tabela.managers.rows.height}px`;

		this.virtualization.update(true);
	}
}
