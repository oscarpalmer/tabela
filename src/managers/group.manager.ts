import {sort} from '@oscarpalmer/atoms/array';
import {toMap} from '@oscarpalmer/atoms/array/to-map';
import {toRecord} from '@oscarpalmer/atoms/array/to-record';
import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {Key, Simplify} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import {removeGroup, type GroupComponent} from '../components/group.component';
import {
	EVENT_GROUP_ADD,
	EVENT_GROUP_CLEAR,
	EVENT_GROUP_REMOVE,
	EVENT_GROUP_TOGGLE,
} from '../models/event.model';
import type {TabelaGroupHandlers, TabelaGroupToggle} from '../models/group.model';
import type {State} from '../models/tabela.model';
import {compare} from '@oscarpalmer/atoms/value/compare';
import {getGroup} from '../helpers/misc.helpers';

export class GroupManager {
	collapsed = new Set<Key>();

	enabled = false;

	key!: string;

	handlers: TabelaGroupHandlers = {
		set: (group?: string) => {
			if (group === this.key) {
				return;
			}

			this.enabled = !isNullableOrWhitespace(group);
			this.key = group ?? '';

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
		this.key = state.options.grouping;
	}

	add(group: GroupComponent, emit: boolean): void {
		this.set([...this.items, group]);

		if (emit) {
			this.state.managers.event.emit(EVENT_GROUP_ADD, [getGroup(group)]);
		}
	}

	clear(): void {
		if (this.items.length === 0) {
			return;
		}

		const groups = this.items.splice(0);
		const {length} = groups;

		for (let index = 0; index < length; index += 1) {
			this.remove(groups[index], false);
		}

		this.collapsed.clear();

		this.set([]);

		this.state.managers.event.emit(EVENT_GROUP_CLEAR);
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

		state.managers.event.emit(EVENT_GROUP_TOGGLE, {
			collapsed: group.expanded ? [] : [getGroup(group)],
			expanded: group.expanded ? [getGroup(group)] : [],
		});

		if (Object.keys(state.managers.filter.items).length > 0) {
			state.managers.filter.filter();
		} else if (state.managers.sort.items.length > 0) {
			state.managers.sort.sort();
		} else {
			state.managers.render.update(true, true);
		}
	}

	remove(group: GroupComponent, update: boolean): void {
		removeGroup(group);

		if (!update) {
			return;
		}

		this.set(this.items.filter(item => item !== group));

		this.state.managers.event.emit(EVENT_GROUP_REMOVE, [getGroup(group)]);
	}

	set(items: GroupComponent[]) {
		this.items = sort(items, (first, second) => compare(first.label, second.label));

		this.mapped = toMap(items, group => group.key);

		this.order = toRecord(
			items as Simplify<GroupComponent>[],
			group => group.value.stringified,
			(_, index) => index,
		);
	}
}
