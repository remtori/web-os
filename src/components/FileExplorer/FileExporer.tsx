import { trpc } from '@/trpc';
import {
	Component,
	createResource,
	createSignal,
	For,
	Match,
	Show,
	Switch,
} from 'solid-js';

export const FileExplorer: Component = () => {
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
				<ListFiles data={data()!.data} setCurrentDir={setCurrentDir} />
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
	setCurrentDir: (path: string) => void;
}> = (props) => {
	return (
		<div class="flex flex-col gap-2">
			<For each={props.data}>
				{(file) => (
					<Show
						when={file.name.endsWith('/')}
						fallback={
							<a class="flex flex-row">
								<div>{file.name}</div>
								<div>{file.size}</div>
								<div>{String(file.lastModified)}</div>
							</a>
						}
					>
						<a
							class="flex flex-row"
							onclick={() => props.setCurrentDir(file.name)}
						>
							{file.name}
						</a>
					</Show>
				)}
			</For>
		</div>
	);
};
