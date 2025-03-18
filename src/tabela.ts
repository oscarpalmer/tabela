import {BodyComponent} from './components/body.component';
import {FooterComponent} from './components/footer.component';
import {HeaderComponent} from './components/header.component';
import type {TabelaOptions} from './models/tabela.options';

export class Tabela {
	readonly body: BodyComponent;
	readonly footer: FooterComponent;
	readonly header: HeaderComponent;

	constructor(
		readonly element: HTMLElement,
		readonly options: TabelaOptions,
	) {
		element.role = 'table';

		element.classList.add('tabela');
		element.setAttribute('aria-label', options.label);

		this.header = new HeaderComponent(this);
		this.body = new BodyComponent(this);
		this.footer = new FooterComponent(this);

		element.append(this.header.group, this.body.group, this.footer.group);
	}
}

export function tabela(element: HTMLElement, options: TabelaOptions): Tabela {
	return new Tabela(element, options);
}
