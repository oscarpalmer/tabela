import type {Key} from '@oscarpalmer/atoms/models';
import type {RemovableEventListener} from '@oscarpalmer/toretto/models';
import type {State} from './tabela.model';

// #region Types

export type RenderElements = {
	cells: Record<string, HTMLDivElement[]>;
	rows: HTMLDivElement[];
};

export type RenderManager = {
	fragment: DocumentFragment;
	listener: RemovableEventListener;
	pool: RenderElements;
	state: State;
	top: number;
	visible: RenderVisible;
	destroy(): void;
};

export type RenderOrigin = 'data' | 'filter' | 'sort';

export type RenderRange = {
	end: number;
	start: number;
};

export type RenderVisible = {
	indiced: Map<number, Key>;
	keys: Set<Key>;
};

// #endregion

// #region Variables

export const RENDER_ORIGIN_DATA: RenderOrigin = 'data';

export const RENDER_ORIGIN_FILTER: RenderOrigin = 'filter';

export const RENDER_ORIGIN_SORT: RenderOrigin = 'sort';

// #endregion
