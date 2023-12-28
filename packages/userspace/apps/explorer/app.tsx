export function App() {
	return (
		<div class='flex flex-col justify-center'>
			<button onclick={(e) => console.log('clicked', e)}>Click me</button>
			<ul class='flex flex-col pl-2 ml-2'>
				<li>..</li>
				<li>Folder A</li>
				<li>Folder B</li>
				<li>Folder C</li>
				<li>config.yml</li>
				<li>executable.exe</li>
				<li>text.txt</li>
			</ul>
		</div>
	);
}
