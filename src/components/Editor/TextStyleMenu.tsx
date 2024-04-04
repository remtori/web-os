import Fa from 'solid-fa';
import { Component, createSignal } from 'solid-js';
import { faRegularPro } from '../icons/fontawesome-regular';
import { faCircleDown } from '@fortawesome/free-solid-svg-icons';
import { faLightPro } from '../icons/fontawesome-light';

export type BackFn = () => void;

export const TextStyleMenu: Component<{ back: BackFn }> = (props) => {
	const [CurrentMenuOptions, setOpenedMenu] =
		createSignal<Component>(TextSizeOptions);

	return (
		<>
			<div class="flex h-8 flex-row items-center justify-between px-2">
				<div class="flex flex-row items-center">
					<button
						onclick={() => setOpenedMenu(() => TextSizeOptions)}
						class="mx-2"
					>
						<Fa
							icon={{
								icon: faRegularPro['text-size'] as any,
								prefix: 'far',
								iconName: 'text-size',
							}}
						/>
					</button>
					<button class="mx-2">
						<Fa
							icon={{
								icon: faRegularPro['pen'] as any,
								prefix: 'far',
								iconName: 'pen',
							}}
						/>
					</button>
					<button class="mx-2">
						<Fa
							icon={{
								icon: faRegularPro['fill-drip'] as any,
								prefix: 'far',
								iconName: 'fill-drip',
							}}
						/>
					</button>
					<button
						onclick={() => setOpenedMenu(() => ListOptions)}
						class="mx-2"
					>
						<Fa
							icon={{
								icon: faRegularPro['list-tree'] as any,
								prefix: 'far',
								iconName: 'list-tree',
							}}
						/>
					</button>
					<button
						onclick={() => setOpenedMenu(() => AlignOptions)}
						class="mx-2"
					>
						<Fa
							icon={{
								icon: faRegularPro['align-justify'] as any,
								prefix: 'far',
								iconName: 'align-justify',
							}}
						/>
					</button>
				</div>
				<div class="flex flex-row items-center">
					<div class="mx-2 h-4 border-r border-r-gray-300" />
					<button class="" onclick={props.back}>
						<Fa icon={faCircleDown} />
					</button>
				</div>
			</div>
			{CurrentMenuOptions}
		</>
	);
};

const TextSizeOptions = () => {
	return (
		<div class="flex h-8 flex-row items-center px-6">
			<button class="mx-2">
				<Fa
					icon={{
						icon: faLightPro.h1 as any,
						prefix: 'fal',
						iconName: 'h1',
					}}
				/>
			</button>
			<button class="mx-2">
				<Fa
					icon={{
						icon: faLightPro.h2 as any,
						prefix: 'fal',
						iconName: 'h2',
					}}
				/>
			</button>
			<button class="mx-2">
				<Fa
					icon={{
						icon: faLightPro.h3 as any,
						prefix: 'fal',
						iconName: 'h3',
					}}
				/>
			</button>
			<div class="mx-2 h-4 border-r border-r-gray-300" />
			<button class="mx-2">
				<Fa
					icon={{
						icon: faRegularPro.bold as any,
						prefix: 'far',
						iconName: 'bold',
					}}
				/>
			</button>
			<button class="mx-2">
				<Fa
					icon={{
						icon: faRegularPro.italic as any,
						prefix: 'far',
						iconName: 'italic',
					}}
				/>
			</button>
			<button class="mx-2">
				<Fa
					icon={{
						icon: faRegularPro.strikethrough as any,
						prefix: 'far',
						iconName: 'strikethrough',
					}}
				/>
			</button>
			<button class="mx-2">
				<Fa
					icon={{
						icon: faRegularPro.underline as any,
						prefix: 'far',
						iconName: 'underline',
					}}
				/>
			</button>
		</div>
	);
};

const ListOptions: Component = () => {
	return (
		<div class="flex h-8 flex-row items-center px-6">
			<button class="mx-2">
				<Fa
					icon={{
						icon: faRegularPro.list as any,
						prefix: 'far',
						iconName: 'list',
					}}
				/>
			</button>
			<button class="mx-2">
				<Fa
					icon={{
						icon: faRegularPro['list-ol'] as any,
						prefix: 'far',
						iconName: 'list-ol',
					}}
				/>
			</button>
			<div class="mx-2 h-4 border-r border-r-gray-300" />
			<button class="mx-2">
				<Fa
					icon={{
						icon: faRegularPro.indent as any,
						prefix: 'far',
						iconName: 'indent',
					}}
				/>
			</button>
			<button class="mx-2">
				<Fa
					icon={{
						icon: faRegularPro.outdent as any,
						prefix: 'far',
						iconName: 'outdent',
					}}
				/>
			</button>
		</div>
	);
};

const AlignOptions: Component = () => {
	return (
		<div class="flex h-8 flex-row items-center px-6">
			<button class="mx-2">
				<Fa
					icon={{
						icon: faRegularPro['align-left'] as any,
						prefix: 'far',
						iconName: 'align-left',
					}}
				/>
			</button>
			<button class="mx-2">
				<Fa
					icon={{
						icon: faRegularPro['align-center'] as any,
						prefix: 'far',
						iconName: 'align-center',
					}}
				/>
			</button>
			<button class="mx-2">
				<Fa
					icon={{
						icon: faRegularPro['align-right'] as any,
						prefix: 'far',
						iconName: 'align-right',
					}}
				/>
			</button>
		</div>
	);
};
