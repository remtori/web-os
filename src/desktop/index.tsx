import { createSignal } from 'solid-js';
import Fa from 'solid-fa';
import { faMinus, faXmark, faExpand } from '@fortawesome/free-solid-svg-icons';
import { faWindowMaximize } from '@fortawesome/free-regular-svg-icons';

function WindowWidget() {
	const [x, setX] = createSignal(100);
	const [y, setY] = createSignal(200);
	const [width, setWidth] = createSignal(400);
	const [height, setHeight] = createSignal(600);

	const [maximized, setMaximize] = createSignal(false);

	// setInterval(() => {
	// 	setX((x() + 1) % 400);
	// }, 30);

	return (
		<div
			class='absolute shadow-lg flex flex-col justify-start items-center'
			style={{
				left: `${x()}px`,
				top: `${y()}px`,
				width: `${width()}px`,
				height: `${height()}px`,
			}}
		>
			<div class='rounded-t-sm h-8 w-full bg-black opacity-80 flex flex-row justify-between items-center'>
				<div class='text-white p-2'>App icon</div>
				<div class='flex flex-row'>
					<button class='appearance-none bg-transparent border-none text-white p-2 hover:bg-gray-400 hover:bg-opacity-60'>
						<Fa fw icon={faMinus} />
					</button>
					<button
						class='appearance-none bg-transparent border-none text-white p-2 hover:bg-gray-400 hover:bg-opacity-60'
						onClick={() => setMaximize(!maximized())}
					>
						<Fa fw icon={maximized() ? faWindowMaximize : faExpand} />
					</button>
					<button class='appearance-none bg-transparent border-none text-white p-2 hover:bg-red-800'>
						<Fa fw scale={1.4} icon={faXmark} />
					</button>
				</div>
			</div>
			<div class='rounded-b-md w-full bg-white opacity-80 flex flex-grow flex-col'>
				<h1 class='text-2xl font-bold text-center'>SolidJS</h1>
				<p class='text-center'>Hello World!</p>
			</div>
		</div>
	);
}

export function App() {
	return (
		<div class='select-none bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 backdrop-blur-md h-screen w-screen flex flex-col'>
			<div class='flex flex-grow'>
				<WindowWidget />
			</div>
			<div class='h-12 bg-white bg-opacity-50 flex justify-center flex-row'>
				<div class='flex justify-center items-center p-2'>
					<div class='w-10 h-10 bg-gray-300 rounded-full'></div>
				</div>
			</div>
		</div>
	);
}
