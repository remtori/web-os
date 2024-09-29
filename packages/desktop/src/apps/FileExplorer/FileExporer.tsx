import { faFile, faFolder, faSpinner } from '@faw/fa-regular';
import Fa from 'solid-fa';
import {
	Accessor,
	Component,
	For,
	Match,
	Setter,
	Show,
	Switch,
	createResource,
	createSignal,
	onCleanup,
	onMount,
} from 'solid-js';

import { trpc } from '@/trpc';

import { toReadableByteSize } from './readable-byte-size';

export const FileExplorer: Component = () => {
	const [currentDir, setCurrentDir] = createSignal('');
	const [data] = createResource(currentDir, (path) =>
		trpc.s3fs.readdir.query({ path }),
	);

	return (
		<div class="flex grow p-2">
			<Switch>
				<Match when={data.loading}>
					<div class="flex h-full w-full items-center justify-center">
						<Fa
							icon={faSpinner}
							size="3x"
							class="-mt-10 animate-spin"
						/>
					</div>
				</Match>
				<Match when={data.error}>
					<div class="text-red-600">Error: {data.error.message}</div>
				</Match>
				<Match when={data()}>
					<ListFiles
						data={data()!.data}
						currentDir={currentDir}
						setCurrentDir={setCurrentDir}
					/>
				</Match>
			</Switch>
		</div>
	);
};

type Readdir = {
	name: string;
	etag?: string;
	size?: number;
	lastModified?: Date;
}[];

const CDN_PREFIX = 'https://cdn.remtori.com';

const ListFiles: Component<{
	data: Readdir;
	currentDir: Accessor<string>;
	setCurrentDir: Setter<string>;
}> = (props) => {
	let contentRef: HTMLDivElement | undefined;
	const parentDir = props.currentDir().replace(/[^/]+\/$/, '');

	const onContextMenu = (e: Event) => {
		// e.preventDefault();
	};

	onMount(() => {
		contentRef?.addEventListener('contextmenu', onContextMenu);
	});

	onCleanup(() => {
		contentRef?.removeEventListener('contextmenu', onContextMenu);
	});

	return (
		<div ref={contentRef} class="flex h-full w-full flex-col gap-1">
			<Show when={props.currentDir() !== parentDir}>
				<a
					class="flex cursor-pointer items-center"
					onclick={() => props.setCurrentDir(parentDir)}
				>
					<div class="flex flex-row items-center">
						<Fa icon={faFolder} class="mr-1" fw={true} />
						<span>../</span>
					</div>
				</a>
			</Show>
			<For each={props.data}>
				{(file) => {
					const displayName = file.name.replace(
						props.currentDir(),
						'',
					);

					return (
						<Show
							when={file.name.endsWith('/')}
							fallback={
								<a
									class="flex w-full cursor-pointer flex-row items-center justify-between"
									href={`${CDN_PREFIX}/${file.name}`}
									referrerPolicy="no-referrer"
									target="_blank"
								>
									<div class="flex flex-row items-center">
										<Fa
											icon={faFile}
											class="mr-1"
											fw={true}
										/>
										{displayName}
									</div>
									<div>
										{toReadableByteSize(file.size || 0)}
									</div>
								</a>
							}
						>
							<a
								class="flex cursor-pointer flex-row items-center"
								onclick={() => props.setCurrentDir(file.name)}
							>
								<div class="flex flex-row items-center">
									<Fa
										icon={faFolder}
										class="mr-1"
										fw={true}
									/>
									<span>{displayName}</span>
								</div>
							</a>
						</Show>
					);
				}}
			</For>
		</div>
	);
};
