import {createElement, createRowGroup} from '../helpers/dom.helpers';
import type {BodyElements} from '../models/body.model';

function createFaker(): HTMLDivElement {
	return createElement('div', {
		className: 'tabela__faker',
	}, {}, {});
}

export class BodyComponent {
	readonly elements: BodyElements = {
		faker: createFaker(),
		group: undefined as never,
	};

	constructor() {
		const group = createRowGroup(false);

		this.elements.group = group;

		group.className += ' tabela__rowgroup--body';

		group.tabIndex = 0;

		group.append(this.elements.faker);
	}

	destroy(): void {
		this.elements.faker = undefined as never;
		this.elements.group = undefined as never;
	}
}
