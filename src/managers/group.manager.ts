import {sort} from '@oscarpalmer/atoms/array';
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

	handlers = Object.freeze({
		set: (group?: string) => {
			if (group === this.field) {
				return;
			}

			this.enabled = !isNullableOrWhitespace(group);
			this.field = group ?? '';

			this.state.managers.data.set(this.state.managers.data.get());
		},
	} satisfies TabelaGroup);

	items: GroupComponent[] = [];

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

	get(value: unknown) {
		const asString = getString(value);

		return this.items.find(item => item.value.stringified === asString);
	}

	handle(button: HTMLElement): void {
		const value = button.dataset.key?.replace(`tabela_${this.state.id}_group:`, '');
		const group = this.get(value);

		if (group == null) {
			return;
		}

		const {collapsed, items, state} = this;

		group.expanded = !group.expanded;

		const index = items.indexOf(group);

		let first = state.managers.data.state.items.original.indexOf(items[index]) + 1;

		const last =
			items[index + 1] == null
				? state.managers.data.state.items.original.length - 1
				: state.managers.data.state.items.original.indexOf(items[index + 1]) - 1;

		for (; first <= last; first += 1) {
			const key = state.managers.data.state.items.original[first] as Key;

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

		this.order = toRecord(
			items as Simplify<GroupComponent>[],
			group => group.value.stringified,
			(_, index) => index,
		);
	}
}
