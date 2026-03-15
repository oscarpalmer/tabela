import {computed, html, signal} from '@oscarpalmer/abydon';
import {getData} from '../misc/data';
import {tableData} from '../misc/table';
import {getRandomItems} from '@oscarpalmer/atoms/random';

function onAdd(): void {
	const value = amount.peek();

	if (value > 0) {
		tableData()?.add(getData(value));
	}
}

function onClear(): void {
	tableData()?.clear();
}

function onRemove(): void {
	const value = amount.peek();

	if (value > 0) {
		tableData()?.remove(getRandomItems(tableData()?.get() ?? [], value));
	}
}

const amount = signal(10);

const disabledAddORemove = computed(() => amount.get() <= 0);

export default html`
<details class="oui-details actions" open>
	<summary class="oui-details__summary">Actions</summary>
	<div class="flow flex-ai--fe flex-jc--sb">
		<div class="stack stack--small">
			<label class="oui-vh" for="amount">Amount</label>

			<div class="flow flow-small">
				<input class="oui-input" id="amount" type="number" value="${amount}" />

				<span role="separator"></span>

				<button class="oui-button oui-button--green oui-button--tiny" type="button" aria-disabled="${disabledAddORemove}" @on="${onAdd}">
					<span aria-hidden="true">&plus;</span>
					<span>Add</span>
				</button>

				<button class="oui-button oui-button--red oui-button--tiny" type="button" aria-disabled="${disabledAddORemove}" @on="${onRemove}">
					<span aria-hidden="true">&minus;</span>
					<span>Remove</span>
				</button>

				<span role="separator"></span>

				<button class="oui-button oui-button--red oui-button--tiny" type="button" @on="${onClear}">
					<span aria-hidden="true">&times;</span>
					<span>Clear</span>
				</button>
			</div>
		</div>
	</div>
</details>
`;
