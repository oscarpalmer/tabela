import {on} from '@oscarpalmer/toretto/event';
import type {RemovableEventListener} from '@oscarpalmer/toretto/models';
import {removeRow, renderRow, RowComponent} from '../components/row.component';
import type {TabelaComponents, TabelaManagers} from '../models/tabela.model';
import type {
	VirtualizationPool,
	VirtualizationRange,
	VirtualizationState,
} from '../models/virtualization.model';

function getRange(this: VirtualizationManager, down: boolean): VirtualizationRange {
	const {components, managers} = this;
	const {clientHeight, scrollTop} = components.body.elements.group;

	const first = Math.floor(scrollTop / managers.row.height);

	const last = Math.min(
		managers.data.values.keys.active?.length ?? managers.data.values.keys.original.length - 1,
		Math.ceil((scrollTop + clientHeight) / managers.row.height) - 1,
	);

	const before = Math.ceil(clientHeight / managers.row.height) * (down ? 1 : 2);
	const after = Math.ceil(clientHeight / managers.row.height) * (down ? 2 : 1);

	const start = Math.max(0, first - before);

	const end = Math.min(
		managers.data.values.keys.active?.length ?? managers.data.values.keys.original.length - 1,
		last + after,
	);

	return {end, start};
}

function onScroll(this: VirtualizationManager): void {
	if (!this.state.active) {
		requestAnimationFrame(() => {
			const top = this.components.body.elements.group.scrollTop;

			this.update(top > this.state.top);

			this.state.active = false;
			this.state.top = top;
		});

		this.state.active = true;
	}
}

export class VirtualizationManager {
	fragment!: DocumentFragment;

	listener: RemovableEventListener;

	readonly pool: VirtualizationPool = {
		cells: {},
		rows: [],
	};

	readonly state: VirtualizationState = {
		active: false,
		top: 0,
	};

	readonly visible = new Map<number, RowComponent>();

	constructor(
		public managers: TabelaManagers,
		public components: TabelaComponents,
	) {
		this.listener = on(components.body.elements.group, 'scroll', onScroll.bind(this));
	}

	destroy(): void {
		this.listener();

		for (const [index, row] of this.visible) {
			removeRow(this.pool, row);

			this.visible.delete(index);
		}

		this.pool.cells = {};
		this.pool.rows = [];
	}

	removeCells(fields: string[]): void {
		const {length} = fields;

		for (let index = 0; index < length; index += 1) {
			delete this.pool.cells[fields[index]];
		}

		for (const [, row] of this.visible) {
			for (let index = 0; index < length; index += 1) {
				row.cells[fields[index]].innerHTML = '';

				row.cells[fields[index]].remove();

				delete row.cells[fields[index]];
			}
		}
	}

	getFragment(): DocumentFragment {
		this.fragment ??= document.createDocumentFragment();

		this.fragment.replaceChildren();

		return this.fragment;
	}

	update(down: boolean, rerender?: boolean): void {
		const {components, managers, pool, visible} = this;

		components.body.elements.faker.style.height = `${managers.data.size * managers.row.height}px`;

		const indices = new Set<number>();
		const range = getRange.call(this, down);

		for (let index = range.start; index <= range.end; index += 1) {
			indices.add(index);
		}

		let remove = rerender ?? false;

		for (const [index, row] of visible) {
			if (!managers.row.has(row.key) || !indices.has(index)) {
				remove = true;
			}

			if (remove) {
				visible.delete(index);

				removeRow(pool, row);
			}
		}

		const fragment = this.getFragment();

		const keys = managers.data.values.keys.active ?? managers.data.values.keys.original;

		let count = 0;

		for (let index = range.start; index <= range.end; index += 1) {
			if (visible.has(index)) {
				continue;
			}

			const row = managers.row.get(keys[index]);

			if (row == null) {
				continue;
			}

			count += 1;

			renderRow(managers, row);

			visible.set(index, row);

			if (row.element != null) {
				row.element.style.transform = `translateY(${index * managers.row.height}px)`;

				fragment.append(row.element);
			}
		}

		if (count > 0) {
			components.body.elements.group[down ? 'append' : 'prepend'](fragment);
		}
	}
}
