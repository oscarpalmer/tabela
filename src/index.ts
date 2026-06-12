import type {TabelaOptions} from './models/tabela.options';
import {Tabela} from './tabela';

// #region Functions

export function tabela(element: HTMLElement, options: TabelaOptions): Tabela {
	return new Tabela(element, options);
}

// #endregion

// #region Exports

export type {Tabela, TabelaOptions};

// #endregion
