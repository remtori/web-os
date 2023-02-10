declare type ExecuteFunction = (ctx: sandbox.Context) => Promise<any> | any;

declare namespace sandbox {
	declare interface NumberInputOptions {
		min?: number;
		max?: number;
		step?: number;
	}

	declare interface StringInputOptions {
		pattern?: RegExp;
		minlength?: number;
		maxlength?: number;
	}

	declare interface Context {
		readFloat(prompt?: string, options?: NumberInputOptions): number;
		readInt(prompt?: string, options?: NumberInputOptions): number;

		readString(prompt?: string, options?: StringInputOptions): string;

		readSelections(prompt?: string, selections: string[]): string;

		write(...args: any[]): void;
		writeln(...args: any[]): void;
	}
}

declare interface Console {
	/**
	 * `console.assert()` writes a message if `value` is [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) or omitted. It only
	 * writes a message and does not otherwise affect execution. The output always
	 * starts with `"Assertion failed"`. If provided, `message` is formatted using `util.format()`.
	 *
	 * If `value` is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy), nothing happens.
	 *
	 * ```js
	 * console.assert(true, 'does nothing');
	 *
	 * console.assert(false, 'Whoops %s work', 'didn\'t');
	 * // Assertion failed: Whoops didn't work
	 *
	 * console.assert();
	 * // Assertion failed
	 * ```
	 * @param value The value tested for being truthy.
	 * @param message All arguments besides `value` are used as error message.
	 */
	assert(value: any, message?: string, ...optionalParams: any[]): void;
	/**
	 * Maintains an internal counter specific to `label` and outputs to `stdout` the
	 * number of times `console.count()` has been called with the given `label`.
	 *
	 * ```js
	 * > console.count()
	 * default: 1
	 * undefined
	 * > console.count('default')
	 * default: 2
	 * undefined
	 * > console.count('abc')
	 * abc: 1
	 * undefined
	 * > console.count('xyz')
	 * xyz: 1
	 * undefined
	 * > console.count('abc')
	 * abc: 2
	 * undefined
	 * > console.count()
	 * default: 3
	 * undefined
	 * >
	 * ```
	 * @param label The display label for the counter.
	 */
	count(label?: string): void;
	/**
	 * Resets the internal counter specific to `label`.
	 *
	 * ```js
	 * > console.count('abc');
	 * abc: 1
	 * undefined
	 * > console.countReset('abc');
	 * undefined
	 * > console.count('abc');
	 * abc: 1
	 * undefined
	 * >
	 * ```
	 * @param label The display label for the counter.
	 */
	countReset(label?: string): void;
	/**
	 * The `console.debug()` function is an alias for {@link log}.
	 */
	debug(message?: any, ...optionalParams: any[]): void;
	/**
	 * Prints to `stderr` with newline. Multiple arguments can be passed, with the
	 * first used as the primary message and all additional used as substitution
	 * values similar to [`printf(3)`](http://man7.org/linux/man-pages/man3/printf.3.html) (the arguments are all passed to `util.format()`).
	 *
	 * ```js
	 * const code = 5;
	 * console.error('error #%d', code);
	 * // Prints: error #5, to stderr
	 * console.error('error', code);
	 * // Prints: error 5, to stderr
	 * ```
	 *
	 * If formatting elements (e.g. `%d`) are not found in the first string then `util.inspect()` is called on each argument and the resulting string
	 * values are concatenated. See `util.format()` for more information.
	 */
	error(message?: any, ...optionalParams: any[]): void;
	/**
	 * Increases indentation of subsequent lines by spaces for `groupIndentation`length.
	 *
	 * If one or more `label`s are provided, those are printed first without the
	 * additional indentation.
	 */
	group(...label: any[]): void;
	/**
	 * An alias for {@link group}.
	 */
	groupCollapsed(...label: any[]): void;
	/**
	 * Decreases indentation of subsequent lines by spaces for `groupIndentation`length.
	 */
	groupEnd(): void;
	/**
	 * The `console.info()` function is an alias for {@link log}.
	 */
	info(message?: any, ...optionalParams: any[]): void;
	/**
	 * Prints to `stdout` with newline. Multiple arguments can be passed, with the
	 * first used as the primary message and all additional used as substitution
	 * values similar to [`printf(3)`](http://man7.org/linux/man-pages/man3/printf.3.html) (the arguments are all passed to `util.format()`).
	 *
	 * ```js
	 * const count = 5;
	 * console.log('count: %d', count);
	 * // Prints: count: 5, to stdout
	 * console.log('count:', count);
	 * // Prints: count: 5, to stdout
	 * ```
	 *
	 * See `util.format()` for more information.
	 */
	log(message?: any, ...optionalParams: any[]): void;
	/**
	 * Try to construct a table with the columns of the properties of `tabularData`(or use `properties`) and rows of `tabularData` and log it. Falls back to just
	 * logging the argument if it can’t be parsed as tabular.
	 *
	 * ```js
	 * // These can't be parsed as tabular data
	 * console.table(Symbol());
	 * // Symbol()
	 *
	 * console.table(undefined);
	 * // undefined
	 *
	 * console.table([{ a: 1, b: 'Y' }, { a: 'Z', b: 2 }]);
	 * // ┌─────────┬─────┬─────┐
	 * // │ (index) │  a  │  b  │
	 * // ├─────────┼─────┼─────┤
	 * // │    0    │  1  │ 'Y' │
	 * // │    1    │ 'Z' │  2  │
	 * // └─────────┴─────┴─────┘
	 *
	 * console.table([{ a: 1, b: 'Y' }, { a: 'Z', b: 2 }], ['a']);
	 * // ┌─────────┬─────┐
	 * // │ (index) │  a  │
	 * // ├─────────┼─────┤
	 * // │    0    │  1  │
	 * // │    1    │ 'Z' │
	 * // └─────────┴─────┘
	 * ```
	 * @param properties Alternate properties for constructing the table.
	 */
	table(tabularData: any, properties?: ReadonlyArray<string>): void;
	/**
	 * Starts a timer that can be used to compute the duration of an operation. Timers
	 * are identified by a unique `label`. Use the same `label` when calling {@link timeEnd} to stop the timer and output the elapsed time in
	 * suitable time units to `stdout`. For example, if the elapsed
	 * time is 3869ms, `console.timeEnd()` displays "3.869s".
	 */
	time(label?: string): void;
	/**
	 * Stops a timer that was previously started by calling {@link time} and
	 * prints the result to `stdout`:
	 *
	 * ```js
	 * console.time('100-elements');
	 * for (let i = 0; i < 100; i++) {}
	 * console.timeEnd('100-elements');
	 * // prints 100-elements: 225.438ms
	 * ```
	 */
	timeEnd(label?: string): void;
	/**
	 * For a timer that was previously started by calling {@link time}, prints
	 * the elapsed time and other `data` arguments to `stdout`:
	 *
	 * ```js
	 * console.time('process');
	 * const value = expensiveProcess1(); // Returns 42
	 * console.timeLog('process', value);
	 * // Prints "process: 365.227ms 42".
	 * doExpensiveProcess2(value);
	 * console.timeEnd('process');
	 * ```
	 */
	timeLog(label?: string, ...data: any[]): void;
	/**
	 * Prints to `stderr` the string `'Trace: '`, followed by the `util.format()` formatted message and stack trace to the current position in the code.
	 *
	 * ```js
	 * console.trace('Show me');
	 * // Prints: (stack trace will vary based on where trace is called)
	 * //  Trace: Show me
	 * //    at repl:2:9
	 * //    at REPLServer.defaultEval (repl.js:248:27)
	 * //    at bound (domain.js:287:14)
	 * //    at REPLServer.runBound [as eval] (domain.js:300:12)
	 * //    at REPLServer.<anonymous> (repl.js:412:12)
	 * //    at emitOne (events.js:82:20)
	 * //    at REPLServer.emit (events.js:169:7)
	 * //    at REPLServer.Interface._onLine (readline.js:210:10)
	 * //    at REPLServer.Interface._line (readline.js:549:8)
	 * //    at REPLServer.Interface._ttyWrite (readline.js:826:14)
	 * ```
	 */
	trace(message?: any, ...optionalParams: any[]): void;
	/**
	 * The `console.warn()` function is an alias for {@link error}.
	 */
	warn(message?: any, ...optionalParams: any[]): void;
}

declare var console: Console;
