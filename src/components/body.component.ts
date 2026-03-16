import {createElement, createRowGroup} from '../helpers/dom.helpers';
import type {BodyElements} from '../models/body.model';
import {ATTRIBUTE_DATA_EVENT, ELEMENT_DIV} from '../models/dom.model';
import {EVENT_BODY} from '../models/event.model';
import {CSS_FAKER, CSS_ROWGROUP_BODY} from '../models/style.model';
import type {State} from '../models/tabela.model';

function createFaker(): HTMLDivElement {
	return createElement(ELEMENT_DIV, {
		className: CSS_FAKER,
	});
}

export class BodyComponent {
	readonly elements: BodyElements = {
		faker: createFaker(),
		group: undefined as never,
	};

	constructor(state: State) {
		const group = createRowGroup(state.options.rowHeight, false);

		this.elements.group = group;

		group.className += ` ${CSS_ROWGROUP_BODY}`;

		group.tabIndex = 0;

		group.setAttribute(ATTRIBUTE_DATA_EVENT, EVENT_BODY);

		group.append(this.elements.faker);
	}

	destroy(): void {
		this.elements.faker = undefined as never;
		this.elements.group = undefined as never;
	}
}
