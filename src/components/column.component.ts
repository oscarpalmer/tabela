import {createColumnElements} from '../helpers/column.helper';
import type {
	Column,
	ColumnComponent,
	ColumnComponentKey,
	TabelaColumn,
} from '../models/column.model';
import type {State} from '../models/tabela.model';

// #region Instances

function ColumnComponent(this: ColumnComponent, state: State, column: TabelaColumn): void {
	const width =
		Number.parseInt(getComputedStyle(document.body).fontSize, 10) *
		(column.width ?? (column.label?.length ?? column.key?.length) * 1.5);

	this.options = {
		width,
		footer: column.footer,
		key: column.key,
		label: column.label ?? column.key,
	} as Column;

	this.key = createKey(this.options.key);

	this.elements = createColumnElements(state, this);
}

ColumnComponent.prototype.destroy = destroyColumn;

// #endregion

// #region Functions

export function createColumn(state: State, column: TabelaColumn): ColumnComponent {
	// @ts-expect-error All good, no worries :-)
	return new ColumnComponent(state, column);
}

function createKey(original: string): ColumnComponentKey {
	const normalized = original.toLowerCase().replace(/[^a-z0-9]+/giu, '_');

	return {
		normalized,
		original,
	};
}

function destroyColumn(this: ColumnComponent): void {
	this.elements.content.remove();
	this.elements.wrapper.remove();
	this.elements.sorter.remove();

	this.elements = undefined as never;
	this.options = undefined as never;
}

// #endregion
