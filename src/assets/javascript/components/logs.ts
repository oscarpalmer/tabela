import '@oscarpalmer/oui/tooltip';
import {computed, fragments, html, type Fragment} from '@oscarpalmer/abydon';
import {logs, onClearLogs, onRemoveLog, type Log} from '../misc/logger';

function renderLog(log: Log): Fragment {
	return html`<li class="flow flex-ai--fs logs__item">
		<div class="stack stack--small fill">
			<p class="logs__item__message">${log.message}</p>
			<div class="flow flow--small">
				<span class="oui-pill oui-pill--tiny">${log.type}</span>
				<span class="oui-pill oui-pill--${log.color} oui-pill--tiny">${log.name}</span>
			</div>
		</div>
		<button
				oui-tooltip="oui-tooltip"
				class="flex-js--fe oui-button oui-button--red oui-button--tiny logs__item__button"
				aria-label="Remove &lsquo;${log.name}&rsquo;"
				@on="${(event: Event) => onRemoveLog(event, log.id)}"
			>
				<span aria-hidden="true">&times;</span>
				<span class="oui-vh">Remove &lsquo;${log.name}&rsquo;</span>
			</button>
	</li>`;
}

const empty = computed(() => logs.length === 0);

const items = fragments(logs, log => log.id, renderLog);

export default html`<oui-popover>
	<button oui-popover-toggle="oui-popover-toggle" class="oui-button" position="above-end">
		<span>Toggle logs</span>
		<i hidden="${empty}">(${() => logs.get('length')})</i>
	</button>
	<div oui-popover-content="oui-popover-content" class="logs__popover">
		<h2>Logs</h2>

		<div class="logs__wrapper">
			<p class="logs__empty" hidden="${() => logs.length > 0}">There are no logs&hellip;</p>
			<ul class="logs" hidden="${empty}">${items}</ul>
		</div>

		<button class="oui-button oui-button--small" @on="${onClearLogs}">
			<span aria-hidden="true">&times;</span>
			<span>Clear logs</span>
		</button>
	</div>
</oui-popover>`;
