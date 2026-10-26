import {min} from '@oscarpalmer/atoms/math';
import {createElement} from '@oscarpalmer/toretto/create';
import {getEventPosition} from '@oscarpalmer/toretto/event';
import {findAncestor} from '@oscarpalmer/toretto/find';
import type {EventPosition} from '@oscarpalmer/toretto/models';
import {ATTRIBUTE_DATA_KEY, ELEMENT_DIV} from '../../models/dom.model';
import {mappedSelectionManagers} from '../../models/selection.model';
import {CSS_SELECTION, SELECTOR_CELL, SELECTOR_ROW, SELECTOR_TABLE} from '../../models/style.model';
import type {State} from '../../models/tabela.model';
import {getKey} from '../misc.helpers';
import {addSelection, removeSelection, setSelection} from '../selection/selection.misc';
import {preventSelection} from '../style.helper';
import {setRangeSelection} from './selection.misc';

// #region Functions

function getPlaceholder(): HTMLElement {
	placeholder ??= createElement(ELEMENT_DIV, {
		property: {
			className: CSS_SELECTION,
		},
	});

	return placeholder;
}

export function onSelectionMouseDown(event: MouseEvent): void {
	if (shifted) {
		const row = findAncestor(event, SELECTOR_ROW);

		if (!(row instanceof HTMLElement)) {
			return;
		}

		startElement = row;
		startPosition = getEventPosition(event)!;

		preventSelection.set();
	}
}

export function onSelectionMouseMove(event: MouseEvent): void {
	if (startElement == null) {
		return;
	}

	const currentPosition = getEventPosition(event)!;

	if (currentPosition == null || startPosition == null) {
		return;
	}

	const element = getPlaceholder();

	if (element.parentElement == null) {
		document.body.append(element);
	}

	const {x: currentLeft, y: currentTop} = currentPosition;
	const {x: selectionLeft, y: selectionTop} = startPosition;

	const top = min([currentTop, selectionTop]);
	const left = min([currentLeft, selectionLeft]);

	const width = Math.abs(currentLeft - selectionLeft);
	const height = Math.abs(currentTop - selectionTop);

	element.style.inset = `${top}px ${window.innerWidth - left - width}px ${window.innerHeight - top - height}px ${left}px`;
}

export function onSelectionMouseUp(event: MouseEvent): void {
	if (startElement == null) {
		return;
	}

	if (!event.shiftKey) {
		shifted = false;

		preventSelection.remove();
	}

	getPlaceholder().remove();

	const row = findAncestor(event, SELECTOR_ROW);

	if (row instanceof HTMLElement) {
		endElement = row;

		const cell = findAncestor(event, SELECTOR_CELL);
		const endTable = findAncestor(endElement, SELECTOR_TABLE);
		const startTable = findAncestor(startElement, SELECTOR_TABLE);

		if (startTable != null && startTable === endTable) {
			const manager = mappedSelectionManagers.get(startTable);

			if (manager != null) {
				setRangeSelection(
					manager.state,
					startElement,
					endElement,
					(cell as HTMLElement)?.dataset.key,
				);
			}
		}
	}

	endElement = undefined;
	startElement = undefined;
	startPosition = undefined as never;
}

export function onSelection(
	state: State,
	event: KeyboardEvent | MouseEvent,
	target: HTMLElement,
): void {
	const key = getKey(target.getAttribute(ATTRIBUTE_DATA_KEY));

	if (key == null) {
		return;
	}

	const {navigation, selection} = state.managers;
	const {keys: items} = selection;

	const cell = findAncestor(event, SELECTOR_CELL);

	if (event.shiftKey) {
		if (selection.last == null) {
			navigation.activate(key, (cell as HTMLElement)?.dataset.key, false);
		} else {
			setRangeSelection(state, selection.last, key, (cell as HTMLElement)?.dataset.key);
		}

		return;
	}

	selection.last = key;

	navigation.activate(key, (cell as HTMLElement)?.dataset.key, false);

	if (event.ctrlKey || event.metaKey) {
		if (items.has(key)) {
			removeSelection(state, [key]);
		} else {
			addSelection(state, [key]);
		}

		return;
	}

	setSelection(state, [key]);
}

export function onSelectionShiftDown(event: KeyboardEvent): void {
	onShift(event, true);
}

export function onSelectionShiftUp(event: KeyboardEvent): void {
	onShift(event, false);
}

function onShift(event: KeyboardEvent, value: boolean): void {
	if (event.key === 'Shift') {
		shifted = value;
	}
}

// #endregion

// #region Variables

let shifted = false;

let endElement: HTMLElement | undefined;
let placeholder: HTMLElement;
let startPosition: EventPosition;
let startElement: HTMLElement | undefined;

// #endregion
