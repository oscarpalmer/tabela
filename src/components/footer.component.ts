import {createRowGroupElement} from '../helpers/dom.helpers';
import type {FooterComponent} from '../models/footer.model';
import {CSS_ROW_FOOTER, CSS_ROWGROUP_FOOTER} from '../models/style.model';
import type {State} from '../models/tabela.model';

// #region Instances

function FooterComponent(this: FooterComponent, state: State): void {
	const {group, row} = createRowGroupElement(state);

	row.id = `${state.prefix}_footer`;

	this.elements = {
		group,
		row,
		cells: [],
	};

	this.hidden = state.options.footer === false;

	group.classList.add(CSS_ROWGROUP_FOOTER);
	row.classList.add(CSS_ROW_FOOTER);

	if (this.hidden) {
		group.hidden = true;
	}
}

FooterComponent.prototype.destroy = destroyFooter;

// #endregion

// #region Functions

export function createFooter(state: State): FooterComponent {
	// @ts-expect-error All good, no worries :-)
	return new FooterComponent(state);
}

function destroyFooter(this: FooterComponent): void {
	this.elements.cells.length = 0;

	this.elements.group = undefined as never;
	this.elements.row = undefined as never;
}

// #endregion
