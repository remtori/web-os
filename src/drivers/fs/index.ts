interface FsDriver {
	readdir(path: string): Promise<string[]>;
	readFile(path: string): Promise<string>;
	writeFile(path: string, data: string): Promise<void>;
}
