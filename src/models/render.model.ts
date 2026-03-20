import type {Key} from '@oscarpalmer/atoms/models';
import type {State} from './tabela.model';

export type RenderElements = {
	cells: Record<string, HTMLDivElement[]>;
	rows: HTMLDivElement[];
};

export type RenderOrigin = 'data' | 'filter' | 'sort';

export type RenderRange = {
	end: number;
	start: number;
};

export type RenderState = {
	active: boolean;
	top: number;
} & State;

export type RenderVisible = {
	indiced: Map<number, Key>;
	keys: Set<Key>;
};

export const RENDER_ORIGIN_DATA: RenderOrigin = 'data';

export const RENDER_ORIGIN_FILTER: RenderOrigin = 'filter';

export const RENDER_ORIGIN_SORT: RenderOrigin = 'sort';
