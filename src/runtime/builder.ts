import { JsExecutor } from "./executor";

type Fn = (...args: never[]) => unknown | Promise<unknown>;

export class JsExecutorBuilder {
	private _syncFns: string[];
	private _asyncFns: string[];
	private _funcs: Record<string, Fn>;
	private _props: Record<string | number, any>;

	constructor(props: Record<string | number, any> = {}) {
		this._syncFns = [];
		this._asyncFns = [];
		this._funcs = {};
		this._props = props;
	}

	addSyncFn(nameOrFunc: Fn): this;
	addSyncFn(nameOrFunc: string, func: Fn): this;
	addSyncFn(nameOrFunc: Fn | string, func?: Fn): this {
		if (typeof nameOrFunc === 'string') {
			this._add('sync', nameOrFunc, func!);
		} else {
			this._add('sync', nameOrFunc.name, nameOrFunc);
		}

		return this;
	}

	addAsyncFn(nameOrFunc: Fn): this;
	addAsyncFn(nameOrFunc: string, func: Fn): this;
	addAsyncFn(nameOrFunc: Fn | string, func?: Fn): this {
		if (typeof nameOrFunc === 'string') {
			this._add('async', nameOrFunc, func!);
		} else {
			this._add('async', nameOrFunc.name, nameOrFunc);
		}

		return this;
	}

	build(): JsExecutor {
		// @ts-ignore
		return new JsExecutor(this._syncFns, this._asyncFns, this._props, this._funcs);
	}

	private _add(type: 'sync' | 'async', name: string, value: any) {
		if (name in this._props || name in this._funcs) {
			throw new Error(`Duplicated property "${name}" when creating context object`);
		}

		switch (type) {
			case 'sync':
				this._syncFns.push(name);
				break;
			case 'async':
				this._asyncFns.push(name);
				break;
			default:
				break;
		}

		this._funcs[name] = value;
	}
}