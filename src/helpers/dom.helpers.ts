type RowGroupWithRow = {
	group: HTMLDivElement;
	row: HTMLDivElement;
};

export function createCell(width: number, body?: boolean): HTMLDivElement {
	const cell = document.createElement('div');

	cell.className = 'tabela__cell';
	cell.role = 'cell';
	cell.style.width = `${width}px`;

	if (body ?? true) {
		cell.classList.add('tabela__cell-body');
	}

	return cell;
}

export function createRowGroup(): RowGroupWithRow;

export function createRowGroup(withRow: boolean): HTMLDivElement;

export function createRowGroup(withRow?: boolean) {
	const group = document.createElement('div');

	group.className = 'tabela__rowgroup';
	group.role = 'rowgroup';

	if (!(withRow ?? true)) {
		return group;
	}

	const row = createRow(false);

	group.append(row);

	return {group, row};
}

export function createRow(withStyle?: boolean): HTMLDivElement {
	const row = document.createElement('div');

	row.className = 'tabela__row';
	row.role = 'row';

	if (withStyle ?? true) {
		row.style.inset = '0 auto auto 0';
		row.style.position = 'absolute';
	}

	return row;
}
