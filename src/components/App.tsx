import { Editor } from './Editor';

export const App = () => {
	return (
		<div
			// oncontextmenu={(e) => e.preventDefault()}
			class="flex min-h-screen w-screen flex-col"
		>
			<div class="group my-1 flex flex-col px-2 text-xl">
				<input
					type="text"
					class="box-border w-full placeholder-gray-400 caret-green-600 placeholder:font-bold focus:outline-none"
					placeholder="Please enter title (required)"
				/>
				<div
					class="h-3 self-end text-xs text-gray-400"
					style={{ 'line-height': '12px' }}
				>
					<span class="hidden group-focus-within:block">0/200</span>
				</div>
				<div class="m-0 w-full border-b border-gray-300"></div>
				<div class="-mt-[1px] w-0 border-b border-green-600 transition-all duration-500 ease-in-out group-focus-within:w-full"></div>
			</div>
			<Editor />
		</div>
	);
};
