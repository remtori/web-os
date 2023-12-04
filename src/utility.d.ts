type Promisify<T extends Record<string | symbol | number, any>> = {
	[K in keyof T]: (...params: Parameters<T[K]>) => Promise<ReturnType<T[K]>>;
};
