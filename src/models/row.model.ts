import type {Key} from '@oscarpalmer/atoms/models';
import type {State} from './tabela.model';

// #region Types

export type RowComponent = {
	cells: Record<string, HTMLDivElement>;
	element: HTMLDivElement | undefined;
	key: Key;
};

export type RowManager = {
	components: Map<Key, RowComponent>;
	state: State;
	destroy(): void;
};

// #endregion
