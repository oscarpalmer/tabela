import {sort} from '@oscarpalmer/atoms/array';
import {toMap} from '@oscarpalmer/atoms/array/to-map';
import {toRecord} from '@oscarpalmer/atoms/array/to-record';
import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {Key, Simplify} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import {removeGroup, type GroupComponent} from '../components/group.component';
import type {TabelaGroup} from '../models/group.model';
import type {State} from '../models/tabela.model';

export class GroupManager {
	collapsed = new Set<Key>();

	enabled = false;

	field!: string;

	handlers: TabelaGroup = {
		set: (group?: string) => {
			if (group === this.field) {
				return;
			}

			this.enabled = !isNullableOrWhitespace(group);
			this.field = group ?? '';

			this.state.managers.data.set(this.state.managers.data.get());
		},
	};

	items: GroupComponent[] = [];

	mapped = new Map<string, GroupComponent>();

	order: Record<never, number> = {};

	constructor(public state: State) {
		if (isNullableOrWhitespace(state.options.grouping)) {
			return;
		}

		this.enabled = true;
		this.field = state.options.grouping;
	}

	add(group: GroupComponent): void {
		this.set([...this.items, group]);
	}

	clear(): void {
		const groups = this.items.splice(0);
		const {length} = groups;

		for (let index = 0; index < length; index += 1) {
			this.remove(groups[index]);
		}
	}

	destroy(): void {
		const groups = this.items.splice(0);
		const {length} = groups;

		for (let index = 0; index < length; index += 1) {
			removeGroup(groups[index]);
		}

		this.collapsed.clear();

		this.handlers = undefined as never;
		this.state = undefined as never;
	}

	getForKey(key: string): GroupComponent | undefined {
		return this.mapped.get(key);
	}

	getForValue(value: unknown): GroupComponent | undefined {
		const asString = getString(value);

		return this.items.find(item => item.value.stringified === asString);
	}

	handle(button: HTMLElement): void {
		const key = button.dataset.key?.replace(`${this.state.prefix}_`, '');
		const group = this.getForKey(key ?? '');

		if (group == null) {
			return;
		}

		const {collapsed, items, state} = this;

		group.expanded = !group.expanded;

		const index = items.indexOf(group);

		let first = state.managers.data.state.keys.original.indexOf(group.key) + 1;

		const last =
			items[index + 1] == null
				? state.managers.data.state.keys.original.length - 1
				: state.managers.data.state.keys.original.indexOf(items[index + 1].key) - 1;

		for (; first <= last; first += 1) {
			const key = state.managers.data.state.keys.original[first] as Key;

			if (group.expanded) {
				collapsed.delete(key);
			} else {
				collapsed.add(key);
			}
		}

		if (Object.keys(state.managers.filter.items).length > 0) {
			state.managers.filter.filter();
		} else if (state.managers.sort.items.length > 0) {
			state.managers.sort.sort();
		} else {
			state.managers.render.update(true, true);
		}
	}

	remove(group: GroupComponent): void {
		removeGroup(group);

		this.set(this.items.filter(item => item !== group));
	}

	set(items: GroupComponent[]) {
		this.items = sort(items, item => item.label);

		this.mapped = toMap(items, group => group.key);

		this.order = toRecord(
			items as Simplify<GroupComponent>[],
			group => group.value.stringified,
			(_, index) => index,
		);
	}
}
