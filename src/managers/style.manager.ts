import {appendBaseStyles, updateColumnWidthStyling} from '../helpers/style.helper';
import {type StyleManager} from '../models/style.model';
import type {State} from '../models/tabela.model';

// #region Instances

function StyleManager(this: StyleManager, state: State): void {
	this.state = state;

	appendBaseStyles();
}

StyleManager.prototype.updateWidths = updateWidths;

// #endregion

// #region Functions

export function createStyleManager(state: State): StyleManager {
	// @ts-expect-error All good, no worries :-)
	return new StyleManager(state);
}

function updateWidths(this: StyleManager): void {
	updateColumnWidthStyling(this.state);
}

// #endregion
