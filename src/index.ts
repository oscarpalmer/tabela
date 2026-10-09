import type {Tabela} from './models/tabela.model';
import type {TabelaOptions} from './models/options.model';
import {createTabela} from './tabela';

// #region Functions

export function tabela(element: HTMLElement, options: TabelaOptions): Tabela {
	return createTabela(element, options);
}

// #endregion

// #region Exports

export type {Tabela, TabelaOptions};

// #endregion
