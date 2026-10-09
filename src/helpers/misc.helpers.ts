import type {Key} from '@oscarpalmer/atoms/models';
import {getNumber} from '@oscarpalmer/atoms/number';

// #region Functions

export function getKey(value: unknown): Key | undefined {
	if (typeof value === 'number') {
		return value;
	}

	if (typeof value !== 'string') {
		return;
	}

	const asNumber = getNumber(value);

	return Number.isNaN(asNumber) ? value : asNumber;
}

// #endregion
