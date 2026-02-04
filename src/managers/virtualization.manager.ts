import type {BodyComponent} from '../components/body.component';
import type {RowComponent} from '../components/row.component';

export type ElementPool = {
	cells: Record<string, HTMLDivElement[]>;
	rows: HTMLDivElement[];
};

type Range = {
	end: number;
	start: number;
};

function getRange(body: BodyComponent, down: boolean): Range {
	const {elements, rows} = body;
	const {clientHeight, scrollTop} = elements.group;
	const {rowHeight} = body.tabela.options;

	const first = Math.floor(scrollTop / rowHeight);

	const last = Math.min(rows.length - 1, Math.ceil((scrollTop + clientHeight) / rowHeight) - 1);

	const before = Math.ceil(clientHeight / rowHeight) * (down ? 1 : 2);
	const after = Math.ceil(clientHeight / rowHeight) * (down ? 2 : 1);

	const start = Math.max(0, first - before);
	const end = Math.min(rows.length - 1, last + after);

	return {end, start};
}

export class VirtualizationManager {
	private active = false;

	private readonly pool: ElementPool = {
		cells: {},
		rows: [],
	};

	private top = 0;

	private readonly visible = new Map<number, RowComponent>();

	constructor(private readonly body: BodyComponent) {
		this.body.elements.group.addEventListener(
			'scroll',
			() => {
				this.onScroll();
			},
			{
				passive: true,
			},
		);
	}

	destroy(): void {
		const {visible, pool} = this;

		for (const [index, row] of visible) {
			row.remove(pool);
			visible.delete(index);
		}

		pool.cells = {};
		pool.rows = [];
	}

	update(down: boolean): void {
		const {body, pool, visible} = this;
		const {rowHeight} = body.tabela.options;

		const indices = new Set<number>();
		const range = getRange(body, down);

		for (let index = range.start; index <= range.end; index += 1) {
			indices.add(index);
		}

		for (const [index, row] of visible) {
			if (!indices.has(index)) {
				visible.delete(index);

				row.remove(pool);
			}
		}

		const fragment = document.createDocumentFragment();

		for (let index = range.start; index <= range.end; index += 1) {
			if (!visible.has(index)) {
				const row = body.rows[index];

				row.render(pool);

				visible.set(index, row);

				if (row.element != null) {
					row.element.style.transform = `translateY(${index * rowHeight}px)`;

					fragment.append(row.element);
				}
			}

			body.elements.group.append(fragment);
		}
	}

	private onScroll(): void {
		if (!this.active) {
			requestAnimationFrame(() => {
				const top = this.body.elements.group.scrollTop;

				this.update(top > this.top);

				this.active = false;
				this.top = top;
			});

			this.active = true;
		}
	}
}
