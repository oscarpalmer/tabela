import {destroyTabela, initializeTabela} from './helpers/tabela.helper';
import type {TabelaOptions} from './models/options.model';
import {SYMBOL, type Tabela} from './models/tabela.model';

// #region Instances

function Tabela(this: Tabela, element: HTMLElement, options: TabelaOptions): void {
	this[SYMBOL] = initializeTabela(this, element, options);
}

Tabela.prototype.destroy = destroyTabela;

// #endregion

// #region Functions

export function createTabela(element: HTMLElement, options: TabelaOptions): Tabela {
	// @ts-expect-error All good, no worries :-)
	return new Tabela(element, options);
}

// #endregion
