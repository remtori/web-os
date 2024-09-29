const BYTE_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

const LOCALE_OPTIONS: Intl.NumberFormatOptions = {
	maximumFractionDigits: 1,
	minimumFractionDigits: 0,
};

export function toReadableByteSize(num: number): string {
	if (!Number.isFinite(num)) {
		throw new TypeError(
			`Expected a finite number, got ${typeof num}: ${num}`,
		);
	}

	const isNegative = num < 0;
	const prefix = isNegative ? '-' : '';
	if (isNegative) {
		num = -num;
	}

	if (num < 1) {
		const str = Number(num).toLocaleString(undefined, LOCALE_OPTIONS);
		return prefix + str + BYTE_UNITS[0];
	}

	const exponent = Math.min(
		Math.floor(Math.log(num) / Math.log(1024)),
		BYTE_UNITS.length - 1,
	);
	num /= 1024 ** exponent;

	const str = Number(num).toLocaleString(undefined, LOCALE_OPTIONS);
	const unit = BYTE_UNITS[exponent];
	return prefix + str + unit;
}
