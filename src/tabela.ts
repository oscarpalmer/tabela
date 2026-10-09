import {destroyTabela, initializeTabela} from './helpers/tabela.helper';
import {setColumns} from './managers/column.manager';
import {initializeNavigation} from './managers/navigation.manager';
import {SYMBOL, type Tabela} from './models/tabela.model';
import type {TabelaOptions} from './models/options.model';

// #region Instances

function Tabela(this: Tabela, element: HTMLElement, options: TabelaOptions): void {
	this[SYMBOL] = initializeTabela(this, element, options);

	setColumns(this[SYMBOL], options.columns);

	initializeNavigation(this[SYMBOL]);
}

Tabela.prototype.destroy = destroyTabela;

// #endregion

// #region Functions

export function createTabela(element: HTMLElement, options: TabelaOptions): Tabela {
	// @ts-expect-error All good, no worries :-)
	return new Tabela(element, options);
}

// #endregion
