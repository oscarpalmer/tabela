import {on} from '@oscarpalmer/toretto/event';
import type {RemovableEventListener} from '@oscarpalmer/toretto/models';
import {removeRow, renderRow, RowComponent} from '../components/row.component';
import type {
	VirtualizationPool,
	VirtualizationRange,
	VirtualizationState,
} from '../models/virtualization.model';
import type {Tabela} from '../tabela';

function getRange(tabela: Tabela, down: boolean): VirtualizationRange {
	const {components, managers} = tabela;
	const {body} = components;
	const {data, rows} = managers;
	const {clientHeight, scrollTop} = body.elements.group;

	const first = Math.floor(scrollTop / rows.height);
	const last = Math.min(data.length - 1, Math.ceil((scrollTop + clientHeight) / rows.height) - 1);

	const before = Math.ceil(clientHeight / rows.height) * (down ? 1 : 2);
	const after = Math.ceil(clientHeight / rows.height) * (down ? 2 : 1);

	const start = Math.max(0, first - before);
	const end = Math.min(data.length - 1, last + after);

	return {end, start};
}

function onScroll(this: VirtualizationManager): void {
	if (!this.state.active) {
		requestAnimationFrame(() => {
			const top = this.tabela.components.body.elements.group.scrollTop;

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

	constructor(readonly tabela: Tabela) {
		this.listener = on(tabela.components.body.elements.group, 'scroll', onScroll.bind(this));
	}

	destroy(): void {
		this.listener();

		for (const [index, row] of this.visible) {
			removeRow(row, this.pool);

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

	update(down: boolean): void {
		const {tabela} = this;
		const {rows} = tabela.managers;

		const indices = new Set<number>();
		const range = getRange(tabela, down);

		for (let index = range.start; index <= range.end; index += 1) {
			indices.add(index);
		}

		for (const [index, row] of this.visible) {
			if (!indices.has(index)) {
				this.visible.delete(index);

				removeRow(row, this.pool);
			}
		}

		this.fragment ??= document.createDocumentFragment();

		this.fragment.replaceChildren();

		const keys =
			tabela.managers.data.values.keys.active ?? tabela.managers.data.values.keys.original;

		let count = 0;

		for (let index = range.start; index <= range.end; index += 1) {
			if (this.visible.has(index)) {
				continue;
			}

			const row = tabela.managers.rows.get(keys[index]);

			if (row == null) {
				continue;
			}

			count += 1;

			renderRow(tabela, this.pool, row);

			this.visible.set(index, row);

			if (row.element != null) {
				row.element.style.transform = `translateY(${index * rows.height}px)`;

				this.fragment.append(row.element);
			}
		}

		if (count > 0) {
			tabela.components.body.elements.group[down ? 'append' : 'prepend'](this.fragment);
		}
	}
}
