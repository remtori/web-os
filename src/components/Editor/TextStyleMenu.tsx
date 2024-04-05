import { faH1, faH2, faH3 } from '@deps/fontawesome/fa-light';
import {
	faAlignCenter,
	faAlignJustify,
	faAlignLeft,
	faAlignRight,
	faBold,
	faCircleDown,
	faFillDrip,
	faIndent,
	faItalic,
	faList,
	faListOl,
	faListTree,
	faOutdent,
	faPen,
	faStrikethrough,
	faTextSize,
	faUnderline,
} from '@deps/fontawesome/fa-regular';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import Fa from 'solid-fa';
import { Component, createSignal } from 'solid-js';
import { Btn } from '../Btn';
import { CommandBtn } from './Buttons';

export type BackFn = () => void;

export const TextStyleMenu: Component<{ back: BackFn }> = (props) => {
	const [CurrentMenuOptions, setOpenedMenu] =
		createSignal<Component>(TextSizeOptions);

	return (
		<>
			<div class="flex flex-row items-center justify-between px-2">
				<div class="flex flex-row items-center">
					<Btn
						onClick={() => setOpenedMenu(() => TextSizeOptions)}
						class="p-2"
					>
						<Fa icon={faTextSize} />
					</Btn>
					<Btn class="p-2">
						<Fa icon={faPen} />
					</Btn>
					<Btn class="p-2">
						<Fa icon={faFillDrip} />
					</Btn>
					<Btn
						onClick={() => setOpenedMenu(() => ListOptions)}
						class="p-2"
					>
						<Fa icon={faListTree} />
					</Btn>
					<Btn
						onClick={() => setOpenedMenu(() => AlignOptions)}
						class="p-2"
					>
						<Fa icon={faAlignJustify} />
					</Btn>
				</div>
				<div class="flex flex-row items-center">
					<div class="mx-2 h-4 border-r border-r-gray-300" />
					<Btn class="p-2" onClick={props.back}>
						<Fa icon={faCircleDown} />
					</Btn>
				</div>
			</div>
			{CurrentMenuOptions}
		</>
	);
};

const ToggleMarkBtn: Component<{ mark: string; icon: IconDefinition }> = (
	props,
) => {
	return (
		<CommandBtn class="p-2">
			<Fa icon={props.icon} />
		</CommandBtn>
	);
};

const TextSizeOptions = () => {
	return (
		<div class="flex flex-row items-center px-6">
			<Btn class="p-2">
				<Fa icon={faH1} />
			</Btn>
			<Btn class="p-2">
				<Fa icon={faH2} />
			</Btn>
			<Btn class="p-2">
				<Fa icon={faH3} />
			</Btn>
			<div class="mx-2 h-4 border-r border-r-gray-300" />
			<Btn class="p-2">
				<Fa icon={faBold} />
			</Btn>
			<Btn class="p-2">
				<Fa icon={faItalic} />
			</Btn>
			<Btn class="p-2">
				<Fa icon={faStrikethrough} />
			</Btn>
			<Btn class="p-2">
				<Fa icon={faUnderline} />
			</Btn>
		</div>
	);
};

const ListOptions: Component = () => {
	return (
		<div class="flex flex-row items-center px-6">
			<Btn class="p-2">
				<Fa icon={faList} />
			</Btn>
			<Btn class="p-2">
				<Fa icon={faListOl} />
			</Btn>
			<div class="h-4 border-r border-r-gray-300 p-2" />
			<Btn class="p-2">
				<Fa icon={faIndent} />
			</Btn>
			<Btn class="p-2">
				<Fa icon={faOutdent} />
			</Btn>
		</div>
	);
};

const AlignOptions: Component = () => {
	return (
		<div class="flex flex-row items-center px-6">
			<Btn class="p-2">
				<Fa icon={faAlignLeft} />
			</Btn>
			<Btn class="p-2">
				<Fa icon={faAlignCenter} />
			</Btn>
			<Btn class="p-2">
				<Fa icon={faAlignRight} />
			</Btn>
		</div>
	);
};
