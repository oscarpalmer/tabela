import {toggleStyles, type StyleToggler} from '@oscarpalmer/toretto/style';
import {tabelaCSS} from '../models/style.model';
import type {State} from '../models/tabela.model';

// #region Functions

export function appendBaseStyles(): void {
	if (appended) {
		return;
	}

	appended = true;

	const style = document.createElement('style');

	style.textContent = tabelaCSS;

	document.head.appendChild(style);
}

export function updateColumnWidthStyling(state: State): void {
	const {style} = state.managers;

	if (style.widths == null) {
		style.widths = document.createElement('style');

		state.elements.wrapper.append(style.widths);
	}

	const {length} = state.managers.column.items;

	let styling = '';

	for (let index = 0; index < length; index += 1) {
		const column = state.managers.column.items[index];

		styling += `--tabela-width-${column.key.normalized}: ${column.elements.wrapper.style.width};`;
	}

	style.widths.textContent = `#${state.elements.wrapper.id} { ${styling} }`;
}

// #endregion

// #region Variables

export const preventSelection: StyleToggler = toggleStyles(document.body, {
	userSelect: 'none',
	webkitUserSelect: 'none',
});

let appended = false;

// #endregion
