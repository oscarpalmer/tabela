import {tabelaCSS, type StyleManager} from '../models/style.model';
import type {State} from '../models/tabela.model';

// #region Instances

function StyleManager(this: StyleManager, state: State): void {
	this.state = state;

	appendStyle();
}

// #endregion

// #region Functions

function appendStyle(): void {
	if (appended) {
		return;
	}

	appended = true;

	const style = document.createElement('style');

	style.textContent = tabelaCSS;

	document.head.appendChild(style);
}

export function createStyleManager(state: State): StyleManager {
	// @ts-expect-error All good, no worries :-)
	return new StyleManager(state);
}

// #endregion

// #region Variables

let appended = false;

// #endregion
