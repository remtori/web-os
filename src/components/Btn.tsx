import { JSX, JSXElement, ParentComponent } from 'solid-js';

export const Btn: ParentComponent<
	{
		onClick?: () => void;
	} & JSX.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
	const { onClick, children, ...remainingProps } = props;

	const handleMouseDown = (e: Event) => {
		e.preventDefault();
		onClick?.();
	};

	return (
		<button onmousedown={handleMouseDown} {...remainingProps}>
			{children}
		</button>
	);
};
