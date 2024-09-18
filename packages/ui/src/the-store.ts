import { Accessor, createSignal, onCleanup } from 'solid-js';

type SetStateInternal<T> = {
	_(
		partial: T | Partial<T> | { _(state: T): T | Partial<T> }['_'],
		replace?: false,
	): void;
	_(state: T | { _(state: T): T }['_'], replace: true): void;
}['_'];

interface StoreApi<T> {
	setState: SetStateInternal<T>;
	getState: () => T;
	getInitialState: () => T;
	subscribe: (listener: (state: T, prevState: T) => void) => () => void;
}

type Get<T, K, F> = K extends keyof T ? T[K] : F;

type Mutate<S, Ms> = number extends Ms['length' & keyof Ms]
	? S
	: Ms extends []
		? S
		: Ms extends [[infer Mi, infer Ma], ...infer Mrs]
			? Mutate<StoreMutators<S, Ma>[Mi & StoreMutatorIdentifier], Mrs>
			: never;

type StateCreator<
	T,
	Mis extends [StoreMutatorIdentifier, unknown][] = [],
	Mos extends [StoreMutatorIdentifier, unknown][] = [],
	U = T,
> = ((
	setState: Get<Mutate<StoreApi<T>, Mis>, 'setState', never>,
	getState: Get<Mutate<StoreApi<T>, Mis>, 'getState', never>,
	store: Mutate<StoreApi<T>, Mis>,
) => U) & { $$storeMutators?: Mos };

interface StoreMutators<S, A> {}
type StoreMutatorIdentifier = keyof StoreMutators<unknown, unknown>;

type CreateStoreImpl = <
	T,
	Mos extends [StoreMutatorIdentifier, unknown][] = [],
>(
	initializer: StateCreator<T, [], Mos>,
) => Mutate<StoreApi<T>, Mos>;

const createZustandStore: CreateStoreImpl = (createState) => {
	type TState = ReturnType<typeof createState>;
	type Listener = (state: TState, prevState: TState) => void;

	let state: TState;
	const listeners: Set<Listener> = new Set();

	const setState: StoreApi<TState>['setState'] = (partial, replace) => {
		const nextState =
			typeof partial === 'function'
				? (partial as (state: TState) => TState)(state)
				: partial;

		if (!Object.is(nextState, state)) {
			const previousState = state;
			state =
				(replace ??
				(typeof nextState !== 'object' || nextState === null))
					? (nextState as TState)
					: Object.assign({}, state, nextState);

			listeners.forEach((listener) => listener(state, previousState));
		}
	};

	const getState: StoreApi<TState>['getState'] = () => state;
	const getInitialState: StoreApi<TState>['getInitialState'] = () =>
		initialState;

	const subscribe: StoreApi<TState>['subscribe'] = (listener) => {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	};

	const api = {
		setState,
		getState,
		getInitialState,
		subscribe,
	};
	const initialState = (state = createState(setState, getState, api));

	return api as any;
};

const useStore = <T, U>(
	api: StoreApi<T>,
	selector: (state: T) => U = api.getState as any,
	equalityFn?: (a: U, b: U) => boolean,
) => {
	const initialValue = selector(api.getState());

	if (typeof initialValue === 'function') {
		return initialValue;
	}

	const options: Parameters<typeof createSignal>[1] = {};
	if (equalityFn) {
		options.equals = equalityFn as any;
	}

	const [signal, setSignal] = createSignal(initialValue, options);

	const unsubscribe = api.subscribe((state) => {
		const nextState = selector(state) as any;
		setSignal(nextState);
	});

	onCleanup(() => unsubscribe());
	return signal;
};

type ReadonlyStoreApi<T> = Pick<
	StoreApi<T>,
	'getState' | 'getInitialState' | 'subscribe'
>;

type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

type IsFunction<T> = T extends (...args: any[]) => any ? T : never;

type UseBoundStore<S extends ReadonlyStoreApi<unknown>> = {
	(): Accessor<ExtractState<S>>;
	<U>(
		selector: (state: ExtractState<S>) => U,
	): U extends IsFunction<U> ? U : Accessor<U>;
} & S;

type Create = {
	<T, Mos extends [StoreMutatorIdentifier, unknown][] = []>(
		initializer: StateCreator<T, [], Mos>,
	): UseBoundStore<Mutate<StoreApi<T>, Mos>>;
};

export const createSignalStore = ((createState) => {
	const api = createZustandStore(createState);

	const useBoundStore = (selector: any, equalityFn: any) =>
		useStore(api, selector, equalityFn);

	Object.assign(useBoundStore, api);
	return useBoundStore;
}) as Create;
