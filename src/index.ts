import type {TabelaOptions} from './models/tabela.options';
import {Tabela} from './tabela';

export function tabela(element: HTMLElement, options: TabelaOptions): Tabela {
	return new Tabela(element, options);
}

export type {Tabela, TabelaOptions};
