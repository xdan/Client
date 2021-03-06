/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import flags from 'core/start/flags';
import Component, { rootComponents } from 'core/component';
import { onEverythingReady } from 'core/event';

export default onEverythingReady(async () => {
	const
		node = document.querySelector<HTMLElement>('[data-init-block]');

	if (!node) {
		throw new Error('Root node is not defined');
	}

	const
		name = <string>node.dataset.initBlock,
		component = await rootComponents[name];

	if (!component) {
		throw new Error('Root component is not defined');
	}

	const
		data = <Function>component.data,
		params = JSON.parse(<string>node.dataset.blockParams);

	component.data = function (): Dictionary {
		return Object.assign(data.call(this), params.data);
	};

	// tslint:disable-next-line:no-unused-expression
	new Component({
		...params,
		...component,
		el: node
	});

	READY_STATE++;
}, ...flags);
