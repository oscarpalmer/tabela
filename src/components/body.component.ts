import {createElement, createRowGroup} from '../helpers/dom.helpers';
import type {BodyElements} from '../models/body.model';
import {CSS_TABELA_FAKER, CSS_TABELA_ROWGROUP_BODY} from '../models/style.model';

function createFaker(): HTMLDivElement {
	return createElement(
		'div',
		{
			className: CSS_TABELA_FAKER,
		},
		{},
		{},
	);
}

export class BodyComponent {
	readonly elements: BodyElements = {
		faker: createFaker(),
		group: undefined as never,
	};

	constructor() {
		const group = createRowGroup(false);

		this.elements.group = group;

		group.className += ` ${CSS_TABELA_ROWGROUP_BODY}`;

		group.tabIndex = 0;

		group.setAttribute('data-event', 'body');

		group.append(this.elements.faker);
	}

	destroy(): void {
		this.elements.faker = undefined as never;
		this.elements.group = undefined as never;
	}
}
