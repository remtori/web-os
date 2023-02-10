export const execute: ExecuteFunction = async (ctx) => {
	const a = ctx.readInt('input a', { max: 10 });
	const b = ctx.readFloat('input b');
	ctx.writeln('the answer is', a + b);
}
