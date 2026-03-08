import type {Key} from '@oscarpalmer/atoms/models';

export type TabelaSelection = {
	add(keys: Key[]): void;
	clear(): void;
	remove(keys: Key[]): void;
	set(keys: Key[]): void;
	toggle(): void;
};
