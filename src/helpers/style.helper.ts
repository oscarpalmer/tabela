import {toggleStyles, type StyleToggler} from '@oscarpalmer/toretto/style';

// #region Variables

export const preventSelection: StyleToggler = toggleStyles(document.body, {
	userSelect: 'none',
	webkitUserSelect: 'none',
});

// #endregion
