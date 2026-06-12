import {createElement, createRowGroup} from '../helpers/dom.helpers';
import type {BodyElements} from '../models/body.model';
import {ELEMENT_DIV} from '../models/dom.model';
import {CSS_FAKER, CSS_ROWGROUP_BODY} from '../models/style.model';
import type {State} from '../models/tabela.model';

// #region Types

export class BodyComponent {
	readonly elements: BodyElements = {
		faker: createFaker(),
		group: undefined as never,
	};

	constructor(state: State) {
		const group = createRowGroup(state, false);

		this.elements.group = group;

		group.classList.add(CSS_ROWGROUP_BODY);

		group.append(this.elements.faker);
	}

	destroy(): void {
		this.elements.faker = undefined as never;
		this.elements.group = undefined as never;
	}
}

// #endregion

// #region Functions

function createFaker(): HTMLDivElement {
	return createElement(ELEMENT_DIV, {
		className: CSS_FAKER,
	});
}

// #endregion
