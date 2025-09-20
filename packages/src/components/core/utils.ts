export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export function padStart(
	text: string,
	length: number,
	char: string = " ",
): string {
	return text.padStart(length, char);
}

export function padEnd(
	text: string,
	length: number,
	char: string = " ",
): string {
	return text.padEnd(length, char);
}

export function truncate(text: string, length: number): string {
	if (text.length <= length) return text;
	return `${text.slice(0, length - 1)}…`;
}

export function formatBytes(bytes: number): string {
	const units = ["B", "KB", "MB", "GB", "TB"];
	let value = bytes;
	let unitIndex = 0;

	while (value >= 1024 && unitIndex < units.length - 1) {
		value /= 1024;
		unitIndex++;
	}

	return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function formatNumber(num: number): string {
	return new Intl.NumberFormat().format(num);
}

export function formatDuration(ms: number): string {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	if (hours > 0) {
		return `${hours}h ${minutes % 60}m`;
	}
	if (minutes > 0) {
		return `${minutes}m ${seconds % 60}s`;
	}
	return `${seconds}s`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: Timer | null = null;

	return (...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

export function throttle<T extends (...args: unknown[]) => unknown>(
	func: T,
	limit: number,
): (...args: Parameters<T>) => void {
	let inThrottle = false;

	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => {
				inThrottle = false;
			}, limit);
		}
	};
}

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createKeyMap<T>(
	keys: string[],
	handler: (key: string) => T,
): Record<string, T> {
	return keys.reduce(
		(map, key) => {
			map[key] = handler(key);
			return map;
		},
		{} as Record<string, T>,
	);
}

export function mergeDeep<T extends Record<string, any>>(
	target: T,
	source: Partial<T>,
): T {
	const result = { ...target };

	for (const key in source) {
		if (Object.hasOwn(source, key)) {
			const sourceValue = source[key];
			const targetValue = result[key];

			if (
				typeof sourceValue === "object" &&
				sourceValue !== null &&
				typeof targetValue === "object" &&
				targetValue !== null
			) {
				result[key] = mergeDeep(targetValue, sourceValue);
			} else {
				result[key] = sourceValue;
			}
		}
	}

	return result;
}
