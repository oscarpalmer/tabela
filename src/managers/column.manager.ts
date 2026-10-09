import type {ColumnManager} from '../models/column.model';
import type {State} from '../models/tabela.model';

// #region Instances

function ColumnManager(this: ColumnManager, state: State): void {
	this.items = [];
	this.keys = [];
	this.state = state;
}

ColumnManager.prototype.destroy = destroyColumnManager;

// #endregion

// #region Functions

export function createColumnManager(state: State): ColumnManager {
	// @ts-expect-error All good, no worries :-)
	return new ColumnManager(state);
}

function destroyColumnManager(this: ColumnManager): void {
	const {length} = this.items;

	for (let index = 0; index < length; index += 1) {
		this.items[index].destroy();
	}

	this.items = undefined as never;
	this.keys = undefined as never;
	this.state = undefined as never;
}

// #endregion
