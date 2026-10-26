import {filter} from '@oscarpalmer/atoms/array/filter';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {TabelaColumn} from '../models/column.model';
import type {Options, TabelaGrouping} from '../models/options.model';
import {getValidColumn} from './column.helper';

// #region Functions

function getCallback(input: unknown): Function | undefined {
	if (input == null) {
		return undefined;
	}

	if (typeof input !== 'function') {
		throw new TypeError('Callback must be a function');
	}

	return input;
}

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

function getGrouping(input: unknown): TabelaGrouping | undefined {
	if (typeof input === 'string') {
		return {key: input};
	}

	if (input == null) {
		return undefined;
	}

	if (!isPlainObject(input)) {
		throw new TypeError('Grouping must be a plain object');
	}

	return {
		key: getValidString('Grouping key', input.key, false),
		height: getHeight(input.height, true),
		label: getCallback(input.label) as TabelaGrouping['label'],
	};
}

function getHeight(input: unknown, nullable: true): number | undefined;

function getHeight(input: unknown): number;

function getHeight(input: unknown, nullable?: boolean): number | undefined {
	if (input == null && (nullable ?? false)) {
		return undefined;
	}

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
	const rowHeight = getHeight(input.rowHeight);

	const sorting = getValidString('Sorting', input.sorting, true);

	return {
		columns,
		data,
		key,
		label,
		rowHeight,
		sorting,
		footer: input.footer !== false,
		grouping: getGrouping(input.grouping),
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
