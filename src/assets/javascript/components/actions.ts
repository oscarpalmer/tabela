import {computed, html, signal} from '@oscarpalmer/abydon';
import {getRandomBoolean} from '@oscarpalmer/atoms/random';
import {getRandomItems} from '@oscarpalmer/atoms/random';
import {getData} from '../misc/data';
import {tableData, tableFilter} from '../misc/table';

function onAdd(): void {
	const value = amount.peek();

	if (value > 0) {
		tableData()?.add(getData(value));
	}
}

function onClear(): void {
	tableData()?.clear();
}

function onName(): void {
	tableFilter()?.set([
		{
			comparison: 'includes',
			key: 'name.first',
			value: name.peek(),
		},
	]);
}

function onRemove(): void {
	const value = amount.peek();

	if (value > 0) {
		tableData()?.remove(getRandomItems(tableData()?.get() ?? [], value));
	}
}

function onSynchronize(): void {
	const value = amount.peek();

	if (value <= 0) {
		return;
	}

	tableData()?.synchronize(
		[
			...getRandomItems(
				(tableData()?.get() ?? []).map(item => ({
					...item,
					active: getRandomBoolean(),
				})),
				Math.floor(value / 2),
			),
			...getData(Math.ceil(value / 2)),
		],
		false,
	);
}

function onUpdate(all: boolean): void {
	if (all) {
		updateAll();
	} else {
		updateAmount();
	}
}

function updateAll(): void {
	tableData()?.update(
		tableData()
			?.get()
			.map(item => ({...item, active: getRandomBoolean()})) ?? [],
	);
}

function updateAmount(): void {
	const value = amount.peek();

	if (value > 0) {
		tableData()?.update(
			getRandomItems(tableData()?.get() ?? [], value).map(item => ({
				...item,
				active: getRandomBoolean(),
			})),
		);
	}
}

const amount = signal(10);

const name = signal('');

const disabledAmount = computed(() => amount.get() <= 0);

export default html`
	<div class="flow actions">
		<details class="oui-details" open>
			<summary class="oui-details__summary">Data</summary>
			<div class="flow flex-ai--fe flex-jc--sb">
				<div class="stack stack--small">
					<label class="oui-vh" for="amount">Amount</label>

					<div class="flow flow-small">
						<div class="flow flow-small">
							<input
								class="oui-input"
								id="amount"
								type="number"
								value="${amount}"
							/>

							<div class="stack stack--small">
								<button
									class="flex-as--fs oui-button oui-button--green oui-button--tiny"
									type="button"
									aria-disabled="${disabledAmount}"
									@on="${onAdd}"
								>
									<span aria-hidden="true">&plus;</span>
									<span class="flow flow--small" style="gap: 0.375em"
										>Add <small><i>(${amount})</i></small></span
									>
								</button>

								<button
									class="flex-as--fs oui-button oui-button--red oui-button--tiny"
									type="button"
									aria-disabled="${disabledAmount}"
									@on="${onRemove}"
								>
									<span aria-hidden="true">&minus;</span>
									<span class="flow flow--small" style="gap: 0.375em"
										>Remove <small><i>(${amount})</i></small></span
									>
								</button>
							</div>
						</div>

						<span role="separator"></span>

						<div class="stack stack--small">
							<button
								class="flex-as--fs oui-button oui-button--purple oui-button--tiny"
								type="button"
								aria-disabled="${disabledAmount}"
								@on="${() => onUpdate(false)}"
							>
								<span aria-hidden="true">&#x21bb;</span>
								<span class="flow flow--small" style="gap: 0.375em"
									>Update <small><i>(${amount})</i></small></span
								>
							</button>

							<button
								class="flex-as--fs oui-button oui-button--purple oui-button--tiny"
								type="button"
								@on="${() => onUpdate(true)}"
							>
								<span aria-hidden="true">&#x21bb;</span>
								<span>Update all</span>
							</button>
						</div>

						<span role="separator"></span>

						<button
							class="oui-button oui-button--blue oui-button--tiny"
							type="button"
							aria-disabled="${disabledAmount}"
							@on="${onSynchronize}"
						>
							<span aria-hidden="true">&#x21bb;</span>
							<span class="flow flow--small" style="gap: 0.375em"
								>Synchronize <small><i>(${amount})</i></small></span
							>
						</button>

						<span role="separator"></span>

						<button
							class="oui-button oui-button--red oui-button--tiny"
							type="button"
							@on="${onClear}"
						>
							<span aria-hidden="true">&times;</span>
							<span>Clear</span>
						</button>
					</div>
				</div>
			</div>
		</details>
		<details class="oui-details" open hidden>
			<summary class="oui-details__summary">Filter</summary>
			<div class="flow flex-ai--fe flex-jc--sb">
				<div class="stack stack--small">
					<label class="oui-vh" for="name">Name</label>
					<input
						class="oui-input"
						id="name"
						type="text"
						value="${name}"
						@on="${onName}"
					/>
				</div>
			</div>
		</details>
		<div></div>
	</div>
`;
