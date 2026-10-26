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

// #region Variables

export const NAVIGATION_KEY_ARROW_DOWN = 'ArrowDown';

export const NAVIGATION_KEY_ARROW_LEFT = 'ArrowLeft';

export const NAVIGATION_KEY_ARROW_RIGHT = 'ArrowRight';

export const NAVIGATION_KEY_ARROW_UP = 'ArrowUp';

export const NAVIGATION_KEY_END = 'End';

export const NAVIGATION_KEY_HOME = 'Home';

export const NAVIGATION_KEY_PAGE_DOWN = 'PageDown';

export const NAVIGATION_KEY_PAGE_UP = 'PageUp';

export const navigationAbsoluteKeys: Set<string> = new Set([
	NAVIGATION_KEY_END,
	NAVIGATION_KEY_HOME,
]);

export const navigationArrowKeys: Set<string> = new Set([
	NAVIGATION_KEY_ARROW_DOWN,
	NAVIGATION_KEY_ARROW_LEFT,
	NAVIGATION_KEY_ARROW_RIGHT,
	NAVIGATION_KEY_ARROW_UP,
]);

export const navigationHorizntalKeys: Set<string> = new Set([
	NAVIGATION_KEY_ARROW_LEFT,
	NAVIGATION_KEY_ARROW_RIGHT,
]);

export const navigationOffset: Record<string, number> = {
	[NAVIGATION_KEY_ARROW_DOWN]: 1,
	[NAVIGATION_KEY_ARROW_LEFT]: -1,
	[NAVIGATION_KEY_ARROW_RIGHT]: 1,
	[NAVIGATION_KEY_ARROW_UP]: -1,
	[NAVIGATION_KEY_PAGE_DOWN]: 10,
	[NAVIGATION_KEY_PAGE_UP]: -10,
};

export const navigationPageKeys: Set<string> = new Set([
	NAVIGATION_KEY_PAGE_DOWN,
	NAVIGATION_KEY_PAGE_UP,
]);

export const navigationUpKeys: Set<string> = new Set([
	NAVIGATION_KEY_ARROW_UP,
	NAVIGATION_KEY_PAGE_UP,
]);

export const navigationAllKeys: Set<string> = new Set([
	...navigationAbsoluteKeys,
	...navigationArrowKeys,
	...navigationPageKeys,
]);

// #endregion
