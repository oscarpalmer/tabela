import {on} from '@oscarpalmer/toretto/event';
import type {RemovableEventListener} from '@oscarpalmer/toretto/models';
import {renderGroup} from '../components/group.component';
import {removeRow, renderRow} from '../components/row.component';
import {isGroupKey} from '../helpers/misc.helpers';
import type {
	RenderElementPool,
	RenderRange,
	RenderState,
	RenderVisible,
} from '../models/render.model';
import type {State} from '../models/tabela.model';

function getRange(state: State, down: boolean): RenderRange {
	const {element, managers, options} = state;
	const {clientHeight, scrollTop} = element;

	const {keys} = managers.data;

	const firstIndex = Math.floor(scrollTop / options.rowHeight);
	const lastIndex = keys.length - managers.group.collapsed.size - 1;

	const last = Math.min(lastIndex, Math.ceil((scrollTop + clientHeight) / options.rowHeight) - 1);

	const visible = clientHeight / options.rowHeight;

	const before = Math.ceil(visible) * (down ? 1 : 2);
	const after = Math.ceil(visible) * (down ? 2 : 1);

	const start = Math.max(0, firstIndex - before);
	const end = Math.min(lastIndex, last + after);

	return {end, start};
}

function onScroll(this: RenderManager): void {
	const {state} = this;

	if (!state.active) {
		requestAnimationFrame(() => {
			const top = state.element.scrollTop;

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

	visible: RenderVisible = {
		indiced: new Map(),
		keys: new Set(),
	};

	constructor(state: State) {
		this.listener = on(state.element, 'scroll', onScroll.bind(this));

		this.state = {
			...state,
			active: false,
			top: 0,
		};
	}

	destroy(): void {
		const {listener, pool, visible} = this;

		listener();

		visible.indiced.clear();
		visible.keys.clear();

		const cells = Object.values(pool.cells).flat();

		let {length} = cells;

		for (let index = 0; index < length; index += 1) {
			cells[index].remove();
		}

		length = pool.rows.length;

		for (let index = 0; index < length; index += 1) {
			pool.rows[index].remove();
		}

		pool.cells = {};
		pool.rows = [];

		this.fragment = undefined as never;
		this.listener = undefined as never;
		this.pool = undefined as never;
		this.state = undefined as never;
		this.visible = undefined as never;
	}

	removeCells(keys: string[]): void {
		const {pool, state, visible} = this;
		const {length} = keys;

		for (let index = 0; index < length; index += 1) {
			delete pool.cells[keys[index]];
		}

		for (const [, key] of visible.indiced) {
			if (isGroupKey(key)) {
				continue;
			}

			const row = state.managers.row.get(key, false);

			if (row == null || row.element == null) {
				continue;
			}

			for (let index = 0; index < length; index += 1) {
				row.cells[keys[index]].innerHTML = '';

				row.cells[keys[index]].remove();

				delete row.cells[keys[index]];
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

		components.body.elements.faker.style.height = `${(managers.data.size - managers.group.collapsed.size) * options.rowHeight}px`;

		const indices = new Set<number>();

		const range = getRange(state, down);

		for (let index = range.start; index <= range.end; index += 1) {
			indices.add(index);
		}

		let remove = rerender ?? false;

		for (const [index, key] of visible.indiced) {
			if (isGroupKey(key)) {
				if (remove || !indices.has(index)) {
					visible.indiced.delete(index);
					visible.keys.delete(key);

					state.managers.group.getForKey(key as string)?.element?.remove();
				}

				continue;
			}

			const row = managers.row.get(key, false);

			if (remove || row == null || !indices.has(index) || managers.group.collapsed.has(key)) {
				visible.indiced.delete(index);
				visible.keys.delete(key);

				if (row != null) {
					removeRow(pool, row);
				}
			}
		}

		const fragment = this.getFragment();

		const {keys} = managers.data;

		let count = 0;
		let offset = 0;

		for (let index = range.start; index <= range.end + offset; index += 1) {
			if (visible.indiced.has(index)) {
				continue;
			}

			const key = keys[index];

			if (isGroupKey(key)) {
				const group = managers.group.getForKey(key as string);

				if (group == null) {
					continue;
				}

				count += 1;

				renderGroup(state, group);

				visible.indiced.set(index, group.key);
				visible.keys.add(group.key);

				if (group.element != null) {
					group.element.style.transform = `translateY(${(index - offset) * options.rowHeight}px)`;

					fragment.append(group.element);
				}

				continue;
			}

			const row = managers.row.get(key, true);

			if (row == null) {
				continue;
			}

			if (managers.group.collapsed.has(key)) {
				offset += 1;

				continue;
			}

			count += 1;

			renderRow(state, row);

			visible.indiced.set(index, key);
			visible.keys.add(key);

			if (row.element != null) {
				row.element.style.transform = `translateY(${(index - offset) * options.rowHeight}px)`;

				fragment.append(row.element);
			}
		}

		if (count === 0) {
			return;
		}

		if (down) {
			components.body.elements.group.append(fragment);
		} else {
			components.body.elements.group.prepend(fragment);
		}
	}
}
