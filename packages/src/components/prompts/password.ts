import { formatError, formatMessage } from "../core/colors";

export interface PasswordOptions {
	message: string;
	placeholder?: string;
	mask?: string;
	validate?: (value: string) => string | boolean;
	initialValue?: string;
}

export async function password(options: PasswordOptions): Promise<string> {
	const { message, placeholder, mask = "*", validate, initialValue } = options;

	console.log(formatMessage(message));
	if (placeholder) {
		console.log(formatMessage(`(${placeholder})`));
	}

	// Hide input
	process.stdin.setRawMode(true);

	let value = initialValue || "";
	let cursor = value.length;

	const render = () => {
		const masked = mask.repeat(value.length);
		process.stdout.write(`\r${masked}\r`);
	};

	return new Promise((resolve, reject) => {
		const cleanup = () => {
			process.stdin.setRawMode(false);
			process.stdout.write("\n");
		};

		const handleKey = (key: Buffer) => {
			const keyStr = key.toString();

			if (keyStr === "\r" || keyStr === "\n") {
				cleanup();
				const validation = validate?.(value);
				if (validation === true || !validation) {
					resolve(value);
				} else {
					console.log(
						formatError(
							typeof validation === "string" ? validation : "Invalid input",
						),
					);
					resolve(password(options));
				}
			} else if (keyStr === "\x03" || keyStr === "\x1b") {
				// Ctrl+C or Escape
				cleanup();
				reject(new Error("User cancelled"));
			} else if (keyStr === "\x7f" || key[0] === 8) {
				// Backspace
				if (cursor > 0) {
					value = value.slice(0, cursor - 1) + value.slice(cursor);
					cursor--;
				}
			} else if (key[0] >= 32) {
				// Printable characters
				value = value.slice(0, cursor) + keyStr + value.slice(cursor);
				cursor++;
			}

			render();
		};

		process.stdin.on("data", handleKey);
		render();
	});
}
