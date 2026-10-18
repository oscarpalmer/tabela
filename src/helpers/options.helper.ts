import {filter} from '@oscarpalmer/atoms/array/filter';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {TabelaColumn} from '../models/column.model';
import type {Options} from '../models/options.model';
import {getValidColumn} from './column.helper';

// #region Functions

function getColumns(input: unknown): TabelaColumn[] {
	if (!Array.isArray(input)) {
		throw new TypeError('Columns must be an array');
	}

	return filter(input, getValidColumn);
}

function getData(input: unknown): PlainObject[] {
	if (!Array.isArray(input)) {
		throw new TypeError('Data must be an array');
	}

	return input;
}

function getRowHeight(input: unknown): number {
	if (typeof input !== 'number' || Number.isNaN(input) || input <= 0) {
		throw new TypeError('Row height must be a positive number');
	}

	return input;
}

export function getOptions(input: unknown): Options {
	if (!isPlainObject(input)) {
		throw new TypeError('Options must be a plain object');
	}

	const columns = getColumns(input.columns);
	const data = getData(input.data);
	const key = getValidString('Key', input.key, false);
	const label = getValidString('Label', input.label, false);
	const rowHeight = getRowHeight(input.rowHeight);

	const grouping = getValidString('Grouping', input.grouping, true);
	const sorting = getValidString('Sorting', input.sorting, true);

	return {
		columns,
		data,
		grouping,
		key,
		label,
		rowHeight,
		sorting,
		footer: input.footer !== false,
		relaxedKeys: input.relaxedKeys === true,
	};
}

function getValidString(name: string, input: unknown, nullable: true): string | undefined;

function getValidString(name: string, input: unknown, nullable: false): string;

function getValidString(name: string, input: unknown, nullable?: boolean): string | undefined {
	if (input == null && nullable) {
		return undefined;
	}

	if (typeof input !== 'string' || input.trim().length === 0) {
		throw new TypeError(`${name} must be a non-empty string`);
	}

	return input;
}

// #endregion
