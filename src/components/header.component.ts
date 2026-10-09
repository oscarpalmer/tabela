import {createRowGroupElement} from '../helpers/dom.helpers';
import type {HeaderComponent} from '../models/header.model';
import {CSS_ROW_HEADER, CSS_ROWGROUP_HEADER} from '../models/style.model';
import type {State} from '../models/tabela.model';

// #region Instances

function HeaderComponent(this: HeaderComponent, state: State): void {
	const {group, row} = createRowGroupElement(state);

	row.id = `${state.prefix}_header`;

	this.elements = {group, row};

	group.classList.add(CSS_ROWGROUP_HEADER);
	row.classList.add(CSS_ROW_HEADER);
}

HeaderComponent.prototype.destroy = destroyHeader;

// #endregion

// #region Functions

export function createHeader(state: State): HeaderComponent {
	// @ts-expect-error All good, no worries :-)
	return new HeaderComponent(state);
}

function destroyHeader(this: HeaderComponent): void {
	this.elements.group = undefined as never;
	this.elements.row = undefined as never;
}

// #endregion
