import type {Key} from '@oscarpalmer/atoms/models';
import type {State} from './tabela.model';

// #region Types

export type NavigationManager = {
	active: NavigationManagerActive;
	state: State;
	activate(row?: Key, column?: string, focus?: boolean): void;
	destroy(): void;
};

export type NavigationManagerActive = {
	column?: string;
	index: number;
	row?: Key;
	type?: NavigationManagerActiveType;
};

export type NavigationManagerActiveType = 'footer' | 'group' | 'header' | 'row';

// #endregion
