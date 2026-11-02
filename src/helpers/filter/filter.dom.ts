import {createElement} from '@oscarpalmer/toretto/create';
import type {
	ColumnComponent,
	ColumnComponentElementsFilter,
	ColumnComponentElementsFilterInput,
	ColumnComponentElementsFilterList,
} from '../../models/column.model';
import {DATA_UPDATE_UPDATE} from '../../models/data.model';
import {ATTRIBUTE_DATA_EVENT, ELEMENT_DIV} from '../../models/dom.model';
import {EVENT_FILTER_INPUT, EVENT_FILTER_LIST} from '../../models/event.model';
import {
	CSS_FILTER,
	CSS_FILTER_INPUT,
	CSS_FILTER_ITEM,
	CSS_FILTER_LABEL,
	CSS_FILTER_LIST,
	CSS_HEADING_FILTER,
} from '../../models/style.model';
import type {State} from '../../models/tabela.model';
import {updateFilterableColumns} from './filter.cache';

// #region Functions

export function createFilterElement(
	state: State,
	column: ColumnComponent,
	prefix: string,
): ColumnComponentElementsFilter | undefined {
	if (!state.managers.filter.enabled || !column.options.filterable) {
		return undefined;
	}

	const id = `${prefix}_filter`;

	const button = createElement('button', {
		attribute: {
			popovertarget: id,
		},
		property: {
			className: CSS_HEADING_FILTER,
			tabIndex: -1,
			textContent: 'F',
			type: 'button',
		},
	});

	const [popover, input, list] = createFilterPopover(state, column, id);

	return {
		button,
		input,
		list,
		popover,
	};
}

function createFilterInput(prefix: string): ColumnComponentElementsFilterInput {
	const id = `${prefix}_input`;

	const item = createElement(ELEMENT_DIV, {
		property: {
			className: CSS_FILTER_ITEM,
		},
	});

	const label = createElement('label', {
		attribute: {
			for: id,
		},
		property: {
			className: CSS_FILTER_LABEL,
			textContent: 'Filter',
		},
	});

	const input = createElement('input', {
		attribute: {
			[ATTRIBUTE_DATA_EVENT]: EVENT_FILTER_INPUT,
		},
		property: {
			id,
			className: CSS_FILTER_INPUT,
			type: 'text',
		},
	});

	item.append(label, input);

	return {
		container: item,
		input,
		label,
	};
}

function createFilterList(prefix: string): ColumnComponentElementsFilterList {
	const id = `${prefix}_list`;

	const item = createElement(ELEMENT_DIV, {
		property: {
			className: CSS_FILTER_ITEM,
		},
	});

	const label = createElement('label', {
		attribute: {
			for: id,
		},
		property: {
			className: CSS_FILTER_LABEL,
			textContent: 'Filter',
		},
	});

	const input = createElement('select', {
		attribute: {
			[ATTRIBUTE_DATA_EVENT]: EVENT_FILTER_LIST,
		},
		property: {
			id,
			className: CSS_FILTER_LIST,
			multiple: true,
		},
	});

	item.append(label, input);

	return {
		container: item,
		label,
		input,
	};
}

function createFilterPopover(
	state: State,
	column: ColumnComponent,
	id: string,
): [HTMLDivElement, ColumnComponentElementsFilterInput, ColumnComponentElementsFilterList] {
	const {filter} = state.managers;

	const popover = createElement(ELEMENT_DIV, {
		attribute: {
			ouiPopover: '',
			popover: '',
		},
		property: {
			id,
			className: CSS_FILTER,
		},
	});

	const input = createFilterInput(id);
	const list = createFilterList(id);

	popover.addEventListener('toggle', () => {
		if (filter.active.has(column.key.original)) {
			return;
		}

		filter.active.add(column.key.original);

		void updateFilterableColumns(DATA_UPDATE_UPDATE, state, [column.key.original]).then(() => {});
	});

	popover.append(input.container, list.container);

	return [popover, input, list];
}

// #endregion
