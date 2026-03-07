import {toggleStyles} from '@oscarpalmer/toretto/style';

export const dragStyling = toggleStyles(document.body, {
	userSelect: 'none',
	webkitUserSelect: 'none',
});
