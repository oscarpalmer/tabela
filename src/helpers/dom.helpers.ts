type RowGroupWithRow = {
	group: HTMLDivElement;
	row: HTMLDivElement;
};

export function createCell(width: number): HTMLDivElement {
	const cell = document.createElement('div');

	cell.className = 'tabela__cell';
	cell.role = 'cell';
	cell.style.width = `${width}px`;

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

	const row = createRow();

	group.append(row);

	return {group, row};
}

export function createRow() {
	const row = document.createElement('div');

	row.className = 'tabela__row';
	row.role = 'row';

	return row;
}
