import {min} from '@oscarpalmer/atoms/math';
import {RENDER_SCROLL_END_DELAY, type RenderManager} from '../../models/render.model';
import {measureRenderedHeight, updateOffsets, updatePositions} from './render.misc';
import {updateRendering} from './render.work';

// #region Functions

export function onResize(this: RenderManager, entries: ResizeObserverEntry[]): void {
	const {estimate, offsets, state} = this;
	const {table} = state.elements;
	const {length} = entries;

	const sampling = estimate.count === 0;

	let above = 0;
	let from = -1;

	for (let index = 0; index < length; index += 1) {
		const [position, delta] = measureRenderedHeight(state, entries[index]) ?? [-1, 0];

		if (delta === 0) {
			continue;
		}

		// Changes above the viewport would move the visible content
		if (offsets[position] < table.scrollTop) {
			above += delta;
		}

		from = from === -1 ? position : min([from, position]);
	}

	// First measurements replace the estimate for all unmeasured rows
	if (sampling && estimate.count > 0) {
		from = 0;
	}

	if (from === -1) {
		return;
	}

	updateOffsets(state, from);
	updatePositions(state, from);

	if (above !== 0) {
		table.scrollTop += above;

		// Keep the adjustment from affecting the scroll direction
		this.top += above;
	}

	// Fill gaps left by items that shrank
	updateRendering(state, true);
}

export function onScroll(this: RenderManager): void {
	const {scroll, state} = this;

	const top = state.elements.table.scrollTop;

	scroll.active = true;

	// Fallback for when `scrollend` is not supported
	if (scroll.listener == null) {
		clearTimeout(scroll.timeout);

		scroll.timeout = setTimeout(scroll.ended, RENDER_SCROLL_END_DELAY);
	}

	updateRendering(state, top > this.top);

	this.top = top;
}

export function onScrollEnd(this: RenderManager): void {
	const {offsets, scroll, state} = this;

	scroll.active = false;
	scroll.timeout = undefined;

	// Apply the total height held while scrolling
	state.components.body.elements.faker.style.height = `${offsets.at(-1)}px`;
}

// #endregion
