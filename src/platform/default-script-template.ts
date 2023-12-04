export const meta: Meta = {
	description: 'Read A and B from user input, then output the result of A + B',
};

export const main: Main = async (ctx) => {
	const a = ctx.readInt('input A');
	const b = ctx.readFloat('input B', { max: 10 });
	ctx.writeln('the answer is', a + b);
}
