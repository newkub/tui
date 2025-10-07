export interface InputHandler {
	onKey: (callback: (key: string, data: unknown) => void) => () => void;
	cleanup: () => void;
}

const createInputHandler = (): InputHandler => {
	const listeners = new Map<string, (key: string, data: unknown) => void>();

	const setupInput = (): void => {
		if (process?.stdin?.isTTY) {
			process.stdin.setRawMode(true);
			process.stdin.resume();
			process.stdin.setEncoding("utf8");
		}
	};

	setupInput();

	const onKey = (callback: (key: string, data: unknown) => void): (() => void) => {
		const id = Math.random().toString(36);
		listeners.set(id, callback);

		const listener = (chunk: string) => {
			const key = chunk.toString();

			// Handle special keys
			const specialKeys: Record<string, string> = {
				"\u0003": "ctrl+c", // Ctrl+C
				"\u001b": "escape", // ESC
				"\r": "enter", // Enter
				"\u007f": "backspace", // Backspace
				"\u001b[A": "up", // Up arrow
				"\u001b[B": "down", // Down arrow
				"\u001b[C": "right", // Right arrow
				"\u001b[D": "left", // Left arrow
				" ": "space", // Space
			};

			const keyName = specialKeys[key] || key;

			for (const cb of listeners.values()) {
				cb(keyName, { raw: key });
			}
		};

		if (process?.stdin) {
			process.stdin.on("data", listener);
		}

		return () => {
			listeners.delete(id);
			if (process?.stdin) {
				process.stdin.off("data", listener);
			}
		};
	};

	const cleanup = (): void => {
		listeners.clear();
		if (process?.stdin?.isTTY) {
			process.stdin.setRawMode(false);
			process.stdin.pause();
		}
	};

	return {
		onKey,
		cleanup,
	};
};

export const inputHandler = createInputHandler();

export function hideCursor(): void {
	if (process?.stdout) {
		process.stdout.write("\u001b[?25l");
	}
}

export function showCursor(): void {
	if (process?.stdout) {
		process.stdout.write("\u001b[?25h");
	}
}

export function clearLine(): void {
	if (process?.stdout) {
		process.stdout.write("\u001b[2K\u001b[0G");
	}
}

export function moveCursor(x: number, y: number): void {
	if (process?.stdout) {
		process.stdout.write(`\u001b[${y};${x}H`);
	}
}

export function write(text: string): void {
	if (process?.stdout) {
		process.stdout.write(text);
	}
}

export function writeLine(text: string = ""): void {
	if (process?.stdout) {
		process.stdout.write(`${text}\n`);
	}
}
