import { useWindowControl } from '@/components/WindowWidget';
import { trpc } from '@/trpc';
import {
	Accessor,
	Component,
	createResource,
	createSignal,
	For,
	Match,
	Setter,
	Show,
	Switch,
} from 'solid-js';

export const FileExplorer: Component = () => {
	useWindowControl({ title: 'File Explorer' });

	const [currentDir, setCurrentDir] = createSignal('');
	const [data] = createResource(currentDir, (path) =>
		trpc.s3fs.readdir.query({ path }),
	);

	return (
		<Switch>
			<Match when={data.loading}>
				<div>Loading...</div>
			</Match>
			<Match when={data.error}>
				<div>Error: {data.error.message}</div>
			</Match>
			<Match when={!data()}>
				<div>Empty</div>
			</Match>
			<Match when={data()}>
				<ListFiles
					data={data()!.data}
					currentDir={currentDir}
					setCurrentDir={setCurrentDir}
				/>
			</Match>
		</Switch>
	);
};

type Readdir = {
	name: string;
	etag?: string;
	size?: number;
	lastModified?: Date;
}[];

const ListFiles: Component<{
	data: Readdir;
	currentDir: Accessor<string>;
	setCurrentDir: Setter<string>;
}> = (props) => {
	const parentDir = props.currentDir().replace(/[^/]+\/$/, '');

	return (
		<div class="flex flex-col gap-2">
			<Show when={props.currentDir() !== parentDir}>
				<a
					class="flex flex-row cursor-pointer"
					onclick={() => props.setCurrentDir(parentDir)}
				>
					../
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
								<a class="flex flex-row cursor-pointer justify-between">
									<div>{displayName}</div>
									<div>{file.size}</div>
									<div>{String(file.lastModified)}</div>
								</a>
							}
						>
							<a
								class="flex flex-row cursor-pointer"
								onclick={() => props.setCurrentDir(file.name)}
							>
								{displayName}
							</a>
						</Show>
					);
				}}
			</For>
		</div>
	);
};
