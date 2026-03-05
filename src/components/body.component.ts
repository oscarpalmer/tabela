import {setStyles} from '@oscarpalmer/toretto/style';
import {createElement, createRowGroup} from '../helpers/dom.helpers';
import type {BodyElements} from '../models/body.model';
import type {Tabela} from '../tabela';

function createFaker(): HTMLDivElement {
	return createElement(
		'div',
		{},
		{
			height: '0',
			inset: '0 auto auto 0',
			opacity: '0',
			pointerEvents: 'none',
			position: 'absolute',
			width: '1px',
		},
	);
}

export class BodyComponent {
	readonly elements: BodyElements = {
		faker: createFaker(),
		group: undefined as never,
	};

	constructor(readonly tabela: Tabela) {
		const group = createRowGroup(false);

		this.elements.group = group;

		group.className += ' tabela__rowgroup-body';

		group.tabIndex = 0;

		setStyles(group, {
			height: '100%',
			overflow: 'auto',
			position: 'relative',
		});

		group.append(this.elements.faker);
	}

	destroy(): void {
		this.elements.faker = undefined as never;
		this.elements.group = undefined as never;
	}
}
