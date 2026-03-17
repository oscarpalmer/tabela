import type {Key} from '@oscarpalmer/atoms/models';
import type {State} from './tabela.model';

export type RenderElementPool = {
	cells: Record<string, HTMLDivElement[]>;
	rows: HTMLDivElement[];
};

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
