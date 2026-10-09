import {getString} from '@oscarpalmer/atoms/string';
import {GROUP_KEY_PREFIX, type GroupComponent} from '../models/group.model';

// #region Instances

function GroupComponent(this: GroupComponent, label: string, value: unknown): void {
	this.expanded = true;
	this.filtered = 0;
	this.label = label;
	this.selected = 0;
	this.total = 0;

	const stringified = getString(value);

	this.key = {
		full: `${GROUP_KEY_PREFIX}${stringified}`,
		short: stringified,
	};

	this.value = {
		stringified,
		original: value,
	};
}

// #endregion

// #region Functions

export function createGroup(label: string, value: unknown): GroupComponent {
	// @ts-expect-error All good, no worries :-)
	return new GroupComponent(label, value);
}

// #endregion
