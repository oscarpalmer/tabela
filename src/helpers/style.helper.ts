import {toggleStyles} from '@oscarpalmer/toretto/style';

export const preventSelection = toggleStyles(document.body, {
	userSelect: 'none',
	webkitUserSelect: 'none',
});
