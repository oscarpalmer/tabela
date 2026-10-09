import type {Key} from '@oscarpalmer/atoms/models';
import type {State, SYMBOL} from './tabela.model';

// #region Types

export type SelectionManager = {
	handlers: TabelaSelection;
	last: Key | undefined;
	keys: Set<Key>;
	state: State;
	destroy(): void;
};

export type TabelaSelection = {
	[SYMBOL]: State;
	add(keys: Key[]): void;
	clear(): void;
	remove(keys: Key[]): void;
	set(keys: Key[]): void;
	toggle(): void;
};

// #endregion
