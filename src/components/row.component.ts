import type {Key} from '@oscarpalmer/atoms/models';
import type {RowComponent} from '../models/row.model';

// #region Instances

function RowComponent(this: RowComponent, key: Key): void {
	this.cells = {};
	this.key = key;
}

// #endregion

// #region Functions

export function createRow(key: Key): RowComponent {
	// @ts-expect-error All good, no worries :-)
	return new RowComponent(key);
}

// #endregion
