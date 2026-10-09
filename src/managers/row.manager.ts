import type {Key} from '@oscarpalmer/atoms/models';
import {clearRows} from '../helpers/row.helper';
import type {RowComponent, RowManager} from '../models/row.model';
import type {State} from '../models/tabela.model';

// #region Instances

function RowManager(this: RowManager, state: State): void {
	this.components = new Map<Key, RowComponent>();
	this.state = state;
}

RowManager.prototype.destroy = destroyRowManager;

// #endregion

// #region Functions

export function createRowManager(state: State): RowManager {
	// @ts-expect-error All good, no worries :-)
	return new RowManager(state);
}

function destroyRowManager(this: RowManager): void {
	clearRows(this.state);

	this.components = undefined as never;
	this.state = undefined as never;
}

// #endregion
