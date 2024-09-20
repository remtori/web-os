export type WorkerSpawnOptions = {
	url: string;
	workerType: WorkerType;
};

export type WorkerInitMessage = {
	type: 'init';
	url: string;
	workerType: WorkerType;
};
