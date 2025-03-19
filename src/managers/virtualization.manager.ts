import type {BodyComponent} from '../components/body.component';
import type {RowComponent} from '../components/row.component';

type Range = {
	end: number;
	start: number;
};

function getRange(body: BodyComponent, down: boolean): Range {
	const {group, rows} = body;
	const {clientHeight, scrollTop} = group;

	const first = Math.floor(scrollTop / 32);

	const last = Math.min(
		rows.length - 1,
		Math.ceil((scrollTop + clientHeight) / 32) - 1,
	);

	const before = Math.ceil(clientHeight / 32) * (down ? 1 : 2);
	const after = Math.ceil(clientHeight / 32) * (down ? 2 : 1);

	const start = Math.max(0, first - before);
	const end = Math.min(rows.length - 1, last + after);

	return {end, start};
}

export class VirtualizationManager {
	private active = false;
	private top = 0;
	private readonly visible = new Map<number, RowComponent>();

	constructor(private readonly body: BodyComponent) {
		this.body.group.addEventListener(
			'scroll',
			() => {
				this.onScroll();
			},
			{
				passive: true,
			},
		);
	}

	update(down: boolean): void {
		const {body, visible} = this;

		const indices = new Set<number>();
		const range = getRange(body, down);

		for (let index = range.start; index <= range.end; index += 1) {
			indices.add(index);
		}

		for (const [index, row] of visible) {
			if (!indices.has(index)) {
				visible.delete(index);
				row.element.remove();
			}
		}

		const fragment = document.createDocumentFragment();

		for (let index = range.start; index <= range.end; index += 1) {
			if (!visible.has(index)) {
				const row = body.rows[index];

				row.element.style.inset = '0 auto auto 0';
				row.element.style.position = 'absolute';
				row.element.style.transform = `translateY(${index * 32}px)`;

				row.render();

				visible.set(index, row);

				fragment.append(row.element);
			}

			body.group.append(fragment);
		}
	}

	private onScroll(): void {
		if (!this.active) {
			requestAnimationFrame(() => {
				const top = this.body.group.scrollTop;

				this.update(top > this.top);

				this.active = false;
				this.top = top;
			});

			this.active = true;
		}
	}
}
