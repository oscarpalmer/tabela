import {select} from '@oscarpalmer/atoms/array';
import {toRecord} from '@oscarpalmer/atoms/array/to-record';
import type {Key, PlainObject} from '@oscarpalmer/atoms/models';
import {GroupComponent} from '../../components/group.component';
import {isGroupKey} from '../../helpers/misc.helpers';
import type {DataState, DataValue, TabelaData} from '../../models/data.model';
import type {State} from '../../models/tabela.model';
import {addData} from './data.add';
import {clearData, removeData} from './data.remove';
import {renderData} from './data.render';
import {synchronizeData} from './data.synchronize';
import {updateData} from './data.update';

export class DataManager {
	handlers: TabelaData = {
		add: data => addData(this.state, data, true),
		clear: () => this.clear(),
		get: active => this.get(active),
		remove: items => removeData(this.state, items, true),
		synchronize: (data, remove) => synchronizeData(this.state, data, remove === true),
		update: data => updateData(this.state, data, true),
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

	async clear(): Promise<void> {
		if (this.state.values.array.length > 0) {
			return clearData(this.state, false);
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

		renderData(state);
	}
}
