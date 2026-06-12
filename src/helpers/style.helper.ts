import {toggleStyles} from '@oscarpalmer/toretto/style';

// #region Variables

export const preventSelection = toggleStyles(document.body, {
	userSelect: 'none',
	webkitUserSelect: 'none',
});

// #endregion
