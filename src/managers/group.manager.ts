import {sort} from '@oscarpalmer/atoms/array';
import {toRecord} from '@oscarpalmer/atoms/array/to-record';
import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {Key, Simplify} from '@oscarpalmer/atoms/models';
import type {GroupComponent} from '../components/group.component';
import type {State} from '../models/tabela.model';
import type { TabelaGroup } from '../models/group.model';

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

	constructor(readonly state: State) {
		if (isNullableOrWhitespace(state.options.grouping)) {
			return;
		}

		this.enabled = true;
		this.field = state.options.grouping;
	}

	add(group: GroupComponent): void {
		this.set([...this.items, group]);
	}

	destroy(): void {
		console.log(this);
	}

	get(value: unknown) {
		return this.items.find(item => item.value === value);
	}

	handle(button: HTMLElement): void {
		const key = button.dataset.key;
		const group = this.get(key);

		console.log(button, key, group);

		if (group == null) {
			return;
		}

		const {collapsed, items, state} = this;

		group.expanded = !group.expanded;

		const index = items.indexOf(group);

		let first = state.managers.data.values.keys.original.indexOf(items[index]) + 1;

		const last =
			items[index + 1] == null
				? state.managers.data.keys.length - 1
				: state.managers.data.values.keys.original.indexOf(items[index + 1]) - 1;

		for (; first <= last; first += 1) {
			const key = state.managers.data.values.keys.original[first] as Key;

			if (group.expanded) {
				collapsed.delete(key);
			} else {
				collapsed.add(key);
			}
		}

		state.managers.render.update(true, true);
	}

	remove(group: GroupComponent): void {
		this.set(this.items.filter(item => item !== group));
	}

	set(items: GroupComponent[]) {
		this.items = sort(items, item => item.label);

		this.order = toRecord(items as Simplify<GroupComponent>[], 'value', (_, index) => index);
	}
}
