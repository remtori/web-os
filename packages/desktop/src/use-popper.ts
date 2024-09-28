import { Instance, Options, createPopper } from '@popperjs/core';
import { Accessor, createEffect, createSignal, onCleanup } from 'solid-js';

export function usePopper<
	Target extends HTMLElement,
	Popper extends HTMLElement,
>(
	targetElement: Accessor<Target | undefined | null>,
	popperElement: Accessor<Popper | undefined | null>,
	options: Partial<Options> = {},
): Accessor<Instance | undefined> {
	const [current, setCurrent] = createSignal<Instance>();

	createEffect(() => {
		const target = targetElement();
		const popper = popperElement();

		setCurrent(undefined);
		if (target && popper) {
			const instance = createPopper(target, popper, {});
			instance.setOptions({
				onFirstUpdate: options.onFirstUpdate,
				placement: options.placement ?? 'bottom',
				modifiers: options.modifiers ?? [],
				strategy: options.strategy ?? 'absolute',
			});

			setCurrent(instance);

			onCleanup(() => {
				instance.destroy();
			});
		}
	});

	return current;
}
