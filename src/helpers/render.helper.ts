import {ARIA_ROWCOUNT} from '../models/dom.model';
import {EVENT_RENDER_BEGIN, EVENT_RENDER_END} from '../models/event.model';
import {
	RENDER_ORIGIN_DATA,
	RENDER_ORIGIN_SORT,
	type RenderManager,
	type RenderOrigin,
	type RenderRange,
} from '../models/render.model';
import type {State} from '../models/tabela.model';
import {filterData} from './filter.helper';
import {updateFooter} from './footer.helper';
import {getGroup, isGroupKey, renderGroup} from './group.helper';
import {getRow, removeRow, renderRow} from './row.helper';
import {sortData} from './sort.helper';

// #region Functions

function getFragment(state: State): DocumentFragment {
	state.managers.render.fragment ??= document.createDocumentFragment();

	state.managers.render.fragment.replaceChildren();

	return state.managers.render.fragment;
}

function getRange(state: State, down: boolean): RenderRange {
	const {elements, managers, options} = state;
	const {clientHeight, scrollTop} = elements.table;

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

export function onScroll(this: RenderManager): void {
	const {state} = this;

	const top = state.elements.table.scrollTop;

	update(state, top > this.top);

	this.top = top;
}

export function removeCells(state: State, keys: string[]): void {
	const {pool, visible} = state.managers.render;
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		delete pool.cells[keys[index]];
	}

	for (const [, key] of visible.indiced) {
		if (isGroupKey(key)) {
			continue;
		}

		const row = getRow(state, key, false);

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

export function render(state: State, origin: RenderOrigin): void {
	const {filter, sort} = state.managers;

	if (origin === RENDER_ORIGIN_DATA && Object.keys(filter.items).length > 0) {
		filterData(state);
	} else if (origin !== RENDER_ORIGIN_SORT && sort.items.length > 0) {
		sortData(state);
	} else {
		update(state, true, true);
	}
}

function update(state: State, down: boolean, rerender?: boolean): void {
	const {visible} = state.managers.render;
	const {components, managers, options} = state;

	managers.event.herald.emit(EVENT_RENDER_BEGIN);

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

				getGroup(state, key)?.element?.remove();
			}

			continue;
		}

		const row = getRow(state, key, false);

		if (remove || row == null || !indices.has(index) || managers.group.collapsed.has(key)) {
			visible.indiced.delete(index);
			visible.keys.delete(key);

			if (row != null) {
				removeRow(state, row);
			}
		}
	}

	const fragment = getFragment(state);

	const {keys} = managers.data;

	let count = 0;
	let offset = 0;

	for (let index = range.start; index <= range.end + offset; index += 1) {
		if (visible.indiced.has(index)) {
			continue;
		}

		const key = keys[index];

		if (isGroupKey(key)) {
			const group = getGroup(state, key);

			if (group == null) {
				continue;
			}

			count += 1;

			renderGroup(state, group);

			visible.indiced.set(index, group.key.full);
			visible.keys.add(group.key.full);

			if (group.element != null) {
				group.element.style.transform = `translateY(${(index - offset) * options.rowHeight}px)`;

				fragment.append(group.element);
			}

			continue;
		}

		const row = getRow(state, key, true);

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

	updateFooter(state);

	if (count === 0) {
		return;
	}

	if (down) {
		components.body.elements.group.append(fragment);
	} else {
		components.body.elements.group.prepend(fragment);
	}

	state.elements.table.setAttribute(ARIA_ROWCOUNT, String(state.managers.data.keys.length));

	managers.event.herald.emit(EVENT_RENDER_END);
}

// #endregion

// #endregion
