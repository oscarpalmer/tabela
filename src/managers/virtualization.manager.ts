import {on} from '@oscarpalmer/toretto/event';
import type {RemovableEventListener} from '@oscarpalmer/toretto/models';
import {removeRow, renderRow, RowComponent} from '../components/row.component';
import type {Tabela} from '../tabela';

type Bound = {
	manager: VirtualizationManager;
	state: State;
};

export type ElementPool = {
	cells: Record<string, HTMLDivElement[]>;
	rows: HTMLDivElement[];
};

type Range = {
	end: number;
	start: number;
};

type State = {
	active: boolean;
	top: number;
};

function getRange(tabela: Tabela, down: boolean): Range {
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

function onScroll(this: Bound): void {
	if (!this.state.active) {
		requestAnimationFrame(() => {
			const top = this.manager.tabela.components.body.elements.group.scrollTop;

			this.manager.update(top > this.state.top);

			this.state.active = false;
			this.state.top = top;
		});

		this.state.active = true;
	}
}

export class VirtualizationManager {
	fragment!: DocumentFragment;

	listener: RemovableEventListener;

	readonly #pool: ElementPool = {
		cells: {},
		rows: [],
	};

	readonly #state: State = {
		active: false,
		top: 0,
	};

	readonly #visible = new Map<number, RowComponent>();

	constructor(readonly tabela: Tabela) {
		this.listener = on(
			tabela.components.body.elements.group,
			'scroll',
			onScroll.bind({
				manager: this,
				state: this.#state,
			}),
		);
	}

	destroy(): void {
		this.listener();

		for (const [index, row] of this.#visible) {
			removeRow(row, this.#pool);

			this.#visible.delete(index);
		}

		this.#pool.cells = {};
		this.#pool.rows = [];
	}

	update(down: boolean): void {
		const {tabela} = this;
		const {rows} = tabela.managers;

		const indices = new Set<number>();
		const range = getRange(tabela, down);

		for (let index = range.start; index <= range.end; index += 1) {
			indices.add(index);
		}

		for (const [index, row] of this.#visible) {
			if (!indices.has(index)) {
				this.#visible.delete(index);

				removeRow(row, this.#pool);
			}
		}

		this.fragment ??= document.createDocumentFragment();

		this.fragment.replaceChildren();

		const keys =
			tabela.managers.data.values.keys.active ?? tabela.managers.data.values.keys.original;

		for (let index = range.start; index <= range.end; index += 1) {
			if (this.#visible.has(index)) {
				continue;
			}

			const row = tabela.managers.rows.get(keys[index]);

			if (row == null) {
				continue;
			}

			renderRow(tabela, this.#pool, row);

			this.#visible.set(index, row);

			if (row.element != null) {
				row.element.style.transform = `translateY(${index * rows.height}px)`;

				this.fragment.append(row.element);
			}
		}

		tabela.components.body.elements.group.append(this.fragment);
	}
}
