import {createElement} from '@oscarpalmer/toretto/create';
import {createRowGroupElement} from '../helpers/dom.helpers';
import type {BodyComponent} from '../models/body.model';
import {ELEMENT_DIV} from '../models/dom.model';
import {CSS_FAKER, CSS_ROWGROUP_BODY} from '../models/style.model';
import type {State} from '../models/tabela.model';

// #region Instances

function BodyComponent(this: BodyComponent, state: State): void {
	const faker = createFaker();
	const group = createRowGroupElement(state, false);

	this.elements = {faker, group};

	group.classList.add(CSS_ROWGROUP_BODY);
	group.append(faker);
}

BodyComponent.prototype.destroy = destroyBody;

// #endregion

// #region Functions

export function createBody(state: State): BodyComponent {
	// @ts-expect-error All good, no worries :-)
	return new BodyComponent(state);
}

function createFaker(): HTMLDivElement {
	return createElement(ELEMENT_DIV, {
		property: {
			className: CSS_FAKER,
		},
	});
}

function destroyBody(this: BodyComponent): void {
	this.elements.faker = undefined as never;
	this.elements.group = undefined as never;
}

// #endregion
