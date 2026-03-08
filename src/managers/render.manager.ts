import type {Key} from '@oscarpalmer/atoms/models';
import {on} from '@oscarpalmer/toretto/event';
import type {RemovableEventListener} from '@oscarpalmer/toretto/models';
import {removeRow, renderRow} from '../components/row.component';
import type {RenderElementPool, RenderRange, RenderState} from '../models/render.model';
import type {State} from '../models/tabela.model';

function getRange(this: RenderManager, down: boolean): RenderRange {
	const {components, managers, options} = this.state;
	const {clientHeight, scrollTop} = components.body.elements.group;

	const first = Math.floor(scrollTop / options.rowHeight);

	const last = Math.min(
		(managers.data.values.keys.active?.length ?? managers.data.values.keys.original.length) - 1,
		Math.ceil((scrollTop + clientHeight) / options.rowHeight) - 1,
	);

	const before = Math.ceil(clientHeight / options.rowHeight) * (down ? 1 : 2);
	const after = Math.ceil(clientHeight / options.rowHeight) * (down ? 2 : 1);

	const start = Math.max(0, first - before);

	const end = Math.min(
		(managers.data.values.keys.active?.length ?? managers.data.values.keys.original.length) - 1,
		last + after,
	);

	return {end, start};
}

function onScroll(this: RenderManager): void {
	const {state} = this;

	if (!state.active) {
		requestAnimationFrame(() => {
			const top = state.components.body.elements.group.scrollTop;

			this.update(top > state.top);

			state.active = false;
			state.top = top;
		});

		state.active = true;
	}
}

export class RenderManager {
	fragment!: DocumentFragment;

	listener: RemovableEventListener;

	pool: RenderElementPool = {
		cells: {},
		rows: [],
	};

	state: RenderState;

	visible = new Map<number, Key>();

	constructor(state: State) {
		this.listener = on(state.components.body.elements.group, 'scroll', onScroll.bind(this));

		this.state = {
			...state,
			active: false,
			top: 0,
		};
	}

	destroy(): void {
		const {listener, pool, visible} = this;

		listener();
		visible.clear();

		pool.cells = {};
		pool.rows = [];

		this.fragment = undefined as never;
		this.listener = undefined as never;
		this.pool = undefined as never;
		this.state = undefined as never;
		this.visible = undefined as never;
	}

	removeCells(fields: string[]): void {
		const {pool, state, visible} = this;
		const {length} = fields;

		for (let index = 0; index < length; index += 1) {
			delete pool.cells[fields[index]];
		}

		for (const [, key] of visible) {
			const row = state.managers.row.get(key);

			if (row == null || row.element == null) {
				continue;
			}

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
		const {state, pool, visible} = this;
		const {components, managers, options} = state;

		components.body.elements.faker.style.height = `${managers.data.size * options.rowHeight}px`;

		const indices = new Set<number>();
		const range = getRange.call(this, down);

		for (let index = range.start; index <= range.end; index += 1) {
			indices.add(index);
		}

		let remove = rerender ?? false;

		for (const [index, key] of visible) {
			const row = managers.row.get(key);

			if (remove || row == null || !indices.has(index)) {
				visible.delete(index);

				if (row != null) {
					removeRow(pool, row);
				}
			}
		}

		const fragment = this.getFragment();

		const keys = managers.data.values.keys.active ?? managers.data.values.keys.original;

		let count = 0;

		for (let index = range.start; index <= range.end; index += 1) {
			if (visible.has(index)) {
				continue;
			}

			const key = keys[index];
			const row = managers.row.get(key);

			if (row == null) {
				continue;
			}

			count += 1;

			renderRow(state, row);

			visible.set(index, key);

			if (row.element != null) {
				row.element.style.transform = `translateY(${index * options.rowHeight}px)`;

				fragment.append(row.element);
			}
		}

		if (count > 0) {
			components.body.elements.group[down ? 'append' : 'prepend'](fragment);
		}
	}
}
