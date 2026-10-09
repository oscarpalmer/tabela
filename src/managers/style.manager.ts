import {appendStyles} from '../helpers/style.helper';
import {type StyleManager} from '../models/style.model';
import type {State} from '../models/tabela.model';

// #region Instances

function StyleManager(this: StyleManager, state: State): void {
	this.state = state;

	appendStyles();
}

// #endregion

// #region Functions

export function createStyleManager(state: State): StyleManager {
	// @ts-expect-error All good, no worries :-)
	return new StyleManager(state);
}

// #endregion
