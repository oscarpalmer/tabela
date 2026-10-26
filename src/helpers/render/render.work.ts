import {getString} from '@oscarpalmer/atoms/string';
import {ARIA_ROWCOUNT} from '../../models/dom.model';
import {EVENT_RENDER_BEGIN, EVENT_RENDER_END} from '../../models/event.model';
import {type RenderOrigin, RENDER_ORIGIN_DATA, RENDER_ORIGIN_SORT} from '../../models/render.model';
import type {State} from '../../models/tabela.model';
import {filterData} from '../filter/filter.data';
import {updateFooter} from '../footer.helper';
import {renderGroup, updateGroups} from '../group/group.dom';
import {getGroup} from '../group/group.item';
import {isGroupKey} from '../group/group.misc';
import {getRow, removeRow, renderRow} from '../row.helper';
import {sortData} from '../sort/sort.event';
import {getRenderFragment, getRenderRange, updateOffsets} from './render.misc';

// #region Functions

export function renderOrigin(state: State, origin: RenderOrigin): void {
	const {filter, sort} = state.managers;

	if (origin === RENDER_ORIGIN_DATA && Object.keys(filter.items).length > 0) {
		filterData(state);
	} else if (origin !== RENDER_ORIGIN_SORT && sort.items.length > 0) {
		sortData(state);
	} else {
		updateRendering(state, true, true);
	}
}

export function updateRendering(state: State, down: boolean, rerender?: boolean): void {
	const {offsets: cached, visible} = state.managers.render;
	const {components, managers} = state;
	const {data, event, group} = managers;
	const {keys} = data;

	event.herald.emit(EVENT_RENDER_BEGIN);

	// A length mismatch means the layout changed without a rerender
	const offsets =
		rerender === true || cached.length !== keys.length + 1 ? updateOffsets(state) : cached;

	const range = getRenderRange(state, down, offsets);

	let remove = rerender ?? false;

	for (const [index, key] of visible.indiced) {
		const outside = index < range.start || index > range.end;

		if (isGroupKey(key)) {
			if (remove || outside) {
				visible.indiced.delete(index);
				visible.keys.delete(key);

				getGroup(state, key)?.element?.remove();
			}

			continue;
		}

		const rowComponent = getRow(state, key, false);

		if (remove || rowComponent == null || outside || group.collapsed.has(key)) {
			visible.indiced.delete(index);
			visible.keys.delete(key);

			if (rowComponent != null) {
				removeRow(state, rowComponent);
			}
		}
	}

	const fragment = getRenderFragment(state);

	let count = 0;

	for (let index = range.start; index <= range.end; index += 1) {
		if (visible.indiced.has(index)) {
			continue;
		}

		const key = keys[index];

		if (isGroupKey(key)) {
			const groupComponent = getGroup(state, key);

			if (groupComponent == null) {
				continue;
			}

			count += 1;

			renderGroup(state, groupComponent, index);

			visible.indiced.set(index, groupComponent.key.full);
			visible.keys.set(groupComponent.key.full, index);

			if (groupComponent.element != null) {
				groupComponent.element.style.transform = `translateY(${offsets[index]}px)`;

				fragment.append(groupComponent.element);
			}

			continue;
		}

		if (group.collapsed.has(key)) {
			continue;
		}

		const rowComponent = getRow(state, key, true);

		if (rowComponent == null) {
			continue;
		}

		count += 1;

		renderRow(state, rowComponent, index);

		visible.indiced.set(index, key);
		visible.keys.set(key, index);

		if (rowComponent.element != null) {
			rowComponent.element.style.transform = `translateY(${offsets[index]}px)`;

			fragment.append(rowComponent.element);
		}
	}

	// Hold the total while scrolling, so the scrollbar stays under the cursor
	if (rerender === true || !managers.render.scroll.active) {
		components.body.elements.faker.style.height = `${offsets[keys.length]}px`;
	}

	updateFooter(state);
	updateGroups(state, state.managers.group.items);

	if (count > 0) {
		if (down) {
			components.body.elements.group.append(fragment);
		} else {
			components.body.elements.group.prepend(fragment);
		}
	}

	state.elements.table.setAttribute(ARIA_ROWCOUNT, getString(keys.length));

	event.herald.emit(EVENT_RENDER_END);
}

// #endregion
