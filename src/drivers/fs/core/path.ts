export type ParsedPath = {
	dirname: string;
	// filename with extension
	filename: string;
	// filename without extension
	basename: string;
	extname: string;
};

export const $path = {
	dirname(path: string): string {
		const index = path.lastIndexOf('/');
		if (index === -1) {
			return '';
		}

		return path.slice(0, index);
	},
	parse(path: string): ParsedPath {
		const index = path.lastIndexOf('/');
		if (index === -1) {
			return {
				dirname: '',
				filename: path,
				basename: path,
				extname: '',
			};
		}

		// Special case for root directory
		const dirname = index === 0 ? '/' : path.slice(0, index);
		const filename = path.slice(index + 1);

		const dotIndex = filename.lastIndexOf('.');
		if (dotIndex === -1) {
			return {
				dirname,
				filename,
				basename: filename,
				extname: '',
			};
		}

		return {
			dirname,
			filename,
			basename: filename.slice(0, dotIndex),
			extname: filename.slice(dotIndex),
		};
	},
};
