import {getString} from '@oscarpalmer/atoms/string';
import {findAncestor} from '@oscarpalmer/toretto/find';
import {SELECTOR_DATA_KEY} from '../../models/dom.model';
import {EVENT_FILTER_UPDATE} from '../../models/event.model';
import {FILTER_INCLUDES} from '../../models/filter.model';
import type {State} from '../../models/tabela.model';
import {filterData} from './filter.data';
import {addFilters} from './filter.item';

// #region Functions

export function onFilter(state: State, input: Element): void {
	const header = findAncestor(input, SELECTOR_DATA_KEY);

	if (!(header instanceof HTMLElement)) {
		return;
	}

	const isSelect = input instanceof HTMLSelectElement;

	if (!(input instanceof HTMLInputElement) && !isSelect) {
		return;
	}

	const {filter} = state.managers;

	const value = isSelect ? [...input.selectedOptions].map(option => option.value) : input.value;

	const {key} = header.dataset;

	if (key == null) {
		return;
	}

	const filters = filter.items.get(key) ?? [];
	const existing = filters.find(filter => filter.id === EVENT_FILTER_UPDATE);

	if (existing == null) {
		addFilters(
			state,
			{
				key,
				value,
				comparison: FILTER_INCLUDES,
			},
			EVENT_FILTER_UPDATE,
		);

		return;
	}

	existing.asString = getString(value);
	existing.value = value;

	filterData(state);
}

// #endregion
