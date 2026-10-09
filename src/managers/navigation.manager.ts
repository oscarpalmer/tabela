import type {Key} from '@oscarpalmer/atoms/models';
import {setNavigationStyles} from '../helpers/navigation.helper';
import type {NavigationManager} from '../models/navigation.model';
import type {State} from '../models/tabela.model';

// #region Instances

function NavigationManager(this: NavigationManager, state: State): void {
	this.state = state;

	this.active = {
		index: -1,
	};
}

NavigationManager.prototype.activate = activateNavigation;
NavigationManager.prototype.destroy = destroyNavigationManager;

// #endregion

// #region Functions

function activateNavigation(
	this: NavigationManager,
	row?: Key,
	column?: string,
	focus?: boolean,
): void {
	if (row == null || column == null) {
		return;
	}

	this.active.column = column;
	this.active.index = this.state.managers.data.getIndex(row);
	this.active.row = row;
	this.active.type = 'row';

	setNavigationStyles(this.state, focus);
}

export function createNavigationManager(state: State): NavigationManager {
	// @ts-expect-error All good, no worries :-)
	return new NavigationManager(state);
}

function destroyNavigationManager(this: NavigationManager): void {
	this.active = undefined as never;
	this.state = undefined as never;
}

// #endregion
