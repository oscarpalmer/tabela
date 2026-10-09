import {toggleStyles, type StyleToggler} from '@oscarpalmer/toretto/style';
import {tabelaCSS} from '../models/style.model';

// #region Functions

export function appendStyles(): void {
	if (appended) {
		return;
	}

	appended = true;

	const style = document.createElement('style');

	style.textContent = tabelaCSS;

	document.head.appendChild(style);
}

// #endregion

// #region Variables

export const preventSelection: StyleToggler = toggleStyles(document.body, {
	userSelect: 'none',
	webkitUserSelect: 'none',
});

let appended = false;

// #endregion
