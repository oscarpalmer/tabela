import {max, min} from '@oscarpalmer/atoms/math';
import type {Key} from '@oscarpalmer/atoms/models';
import {parse} from '@oscarpalmer/atoms/string';
import {GROUP_KEY_PREFIX, type GroupComponent} from '../../models/group.model';
import type {RenderRange} from '../../models/render.model';
import type {RowComponent} from '../../models/row.model';
import type {State} from '../../models/tabela.model';
import {getGroup} from '../group/group.item';
import {isGroupKey} from '../group/group.misc';
import {getRow} from '../row.helper';

// #region Functions

function findOffsetIndex(offsets: number[], value: number, inclusive: boolean): number {
	let high = offsets.length;
	let low = 0;

	while (low < high) {
		// Halve and floor in one go
		const middle = (low + high) >>> 1;
		const offset = offsets[middle];

		if (offset > value || (inclusive && offset === value)) {
			high = middle;
		} else {
			low = middle + 1;
		}
	}

	return low;
}

export function getRenderFragment(state: State): DocumentFragment {
	state.managers.render.fragment ??= document.createDocumentFragment();

	state.managers.render.fragment.replaceChildren();

	return state.managers.render.fragment;
}

export function getRenderHeight(state: State, key: Key): number {
	const {managers, options} = state;

	if (isGroupKey(key)) {
		return getGroup(state, key)?.height ?? options.grouping?.height ?? options.rowHeight;
	}

	if (managers.group.collapsed.has(key)) {
		return 0;
	}

	return getRow(state, key, false)?.height ?? managers.render.estimate.value;
}

export function getRenderRange(state: State, down: boolean, offsets: number[]): RenderRange {
	const {clientHeight, scrollTop} = state.elements.table;

	const last = offsets.length - 2;

	// Overscan by viewport heights, with more in the scroll direction
	const top = max([0, scrollTop - clientHeight * (down ? 1 : 2)]);
	const bottom = min([offsets[last + 1], scrollTop + clientHeight * (down ? 3 : 2)]);

	// First item ending below the top, and last item starting above the bottom
	const start = max([0, findOffsetIndex(offsets, top, false) - 1]);
	const end = min([last, findOffsetIndex(offsets, bottom, true) - 1]);

	return {end, start};
}

export function measureRenderedHeight(
	state: State,
	entry: ResizeObserverEntry,
): [number, number] | undefined {
	const {managers, options} = state;
	const {estimate, offsets, visible} = managers.render;

	const {key} = (entry.target as HTMLElement).dataset;

	if (key == null) {
		return undefined;
	}

	const group = key.startsWith(GROUP_KEY_PREFIX);

	const row = group ? undefined : getRow(state, parse(key) ?? key, false);
	const component = group ? getGroup(state, key) : row;
	const position = visible.keys.get(row?.key ?? key);

	if (component == null || position == null) {
		return undefined;
	}

	const minimum = group ? (options.grouping?.height ?? options.rowHeight) : options.rowHeight;
	const height = max([entry.contentRect.height, minimum]);

	if (row != null) {
		// Count only first measurements, but keep the total current
		estimate.count += row.height == null ? 1 : 0;
		estimate.total += height - (row.height ?? 0);
	}

	component.height = height;

	// Compare with the cached height, since it may be estimated
	return [position, height - (offsets[position + 1] - offsets[position])];
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

		if (row?.element == null) {
			continue;
		}

		for (let index = 0; index < length; index += 1) {
			row.cells[keys[index]].innerHTML = '';

			row.cells[keys[index]].remove();

			delete row.cells[keys[index]];
		}
	}
}

export function updateOffsets(state: State, from?: number): number[] {
	const {data, render} = state.managers;
	const {estimate, offsets} = render;
	const {keys} = data;
	const {length} = keys;

	const start = from ?? 0;

	// Reuse the array instead of allocating a new one
	if (start === 0) {
		offsets.length = 0;

		offsets.push(0);

		// Only full rebuilds may change the estimate, as it affects all unmeasured rows
		if (estimate.count > 0) {
			estimate.value = estimate.total / estimate.count;
		}
	} else {
		// Keep offsets up to the start, as they are unaffected
		offsets.length = start + 1;
	}

	for (let index = start; index < length; index += 1) {
		offsets.push(offsets[index] + getRenderHeight(state, keys[index]));
	}

	return offsets;
}

export function updatePositions(state: State, from: number): void {
	const {offsets, visible} = state.managers.render;

	for (const [index, key] of visible.indiced) {
		if (index < from) {
			continue;
		}

		let component: GroupComponent | RowComponent | undefined;

		if (isGroupKey(key)) {
			component = getGroup(state, key);
		} else {
			component = getRow(state, key, false);
		}

		if (component?.element != null) {
			component.element.style.transform = `translateY(${offsets[index]}px)`;
		}
	}
}

// #endregion
