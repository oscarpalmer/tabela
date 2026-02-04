import {BodyComponent} from './components/body.component';
import {FooterComponent} from './components/footer.component';
import {HeaderComponent} from './components/header.component';
import type {TabelaOptions} from './models/tabela.options';

export class Tabela {
	readonly body: BodyComponent;
	readonly footer: FooterComponent;
	readonly header: HeaderComponent;

	constructor(
		public element: HTMLElement,
		readonly options: TabelaOptions,
	) {
		element.innerHTML = '';
		element.role = 'table';

		element.classList.add('tabela');

		element.setAttribute('aria-label', options.label);

		this.header = new HeaderComponent(this);
		this.body = new BodyComponent(this);
		this.footer = new FooterComponent(this);

		element.append(
			this.header.elements.group,
			this.body.elements.group,
			this.footer.elements.group,
		);
	}

	destroy(): void {
		this.body.destroy();
		this.footer.destroy();
		this.header.destroy();

		this.options.columns = [];
		this.options.data = [];

		this.element.innerHTML = '';
		this.element.role = '';

		this.element.classList.remove('tabela');
		this.element.removeAttribute('aria-label');
		this.element.removeAttribute('role');

		this.element = undefined as never;
	}
}
