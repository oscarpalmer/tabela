import type {Key, Primitive} from '@oscarpalmer/atoms/models';
import type {RemovableEventListener} from '@oscarpalmer/toretto/models';
import type {State} from './tabela.model';

// #region Types

export type RenderCallbackResult = Node | Primitive | Array<Node | Primitive>;

export type RenderElements = {
	cells: Record<string, HTMLDivElement[]>;
	rows: HTMLDivElement[];
};

export type RenderEstimate = {
	count: number;
	total: number;
	value: number;
};

export type RenderManager = {
	estimate: RenderEstimate;
	fragment: DocumentFragment;
	listener: RemovableEventListener;
	observer: ResizeObserver;
	offsets: number[];
	pool: RenderElements;
	scroll: RenderScroll;
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

export type RenderScroll = {
	active: boolean;
	ended: () => void;
	listener?: RemovableEventListener;
	timeout?: ReturnType<typeof setTimeout>;
};

export type RenderVisible = {
	indiced: Map<number, Key>;
	keys: Map<Key, number>;
};

// #endregion

// #region Variables

export const RENDER_ORIGIN_DATA: RenderOrigin = 'data';

export const RENDER_ORIGIN_FILTER: RenderOrigin = 'filter';

export const RENDER_ORIGIN_SORT: RenderOrigin = 'sort';

export const RENDER_SCROLL_END_DELAY = 125;

// #endregion
