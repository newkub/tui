import type { PromptResult, TextOptions } from "../../types.js";
import { CANCEL_SYMBOL } from "../../types.js";
import { colors, formatError, formatMessage } from "../core/colors";
import {
	clearLine,
	hideCursor,
	InputHandler,
	showCursor,
	write,
	writeLine,
} from "../core/input";

export function text(options: TextOptions): Promise<PromptResult<string>> {
	return new Promise((resolve) => {
		let value = options.defaultValue || "";
		let error = "";
		const input = new InputHandler();

		const render = () => {
			clearLine();

			const message = formatMessage(options.message);
			const placeholder = options.placeholder
				? colors.dim(`(${options.placeholder})`)
				: "";
			const displayValue = value || placeholder;

			write(`${message} ${displayValue}`);

			if (error) {
				write(`\n${formatError(error)}`);
			}
		};

		const cleanup = () => {
			showCursor();
			input.cleanup();
		};

		const submit = () => {
			if (options.validate) {
				const validation = options.validate(value);
				if (validation !== true) {
					error = typeof validation === "string" ? validation : "Invalid input";
					render();
					return;
				}
			}

			cleanup();
			clearLine();
			writeLine(`${formatMessage(options.message)} ${colors.dim(value)}`);
			resolve(value);
		};

		const cancel = () => {
			cleanup();
			clearLine();
			writeLine(`${formatMessage(options.message)} ${colors.dim("cancelled")}`);
			resolve(CANCEL_SYMBOL);
		};

		hideCursor();
		render();

		const removeKeyListener = input.onKey((key) => {
			error = "";

			switch (key) {
				case "ctrl+c":
					cancel();
					break;
				case "enter":
					submit();
					break;
				case "backspace":
					if (value.length > 0) {
						value = value.slice(0, -1);
						render();
					}
					break;
				case "escape":
					cancel();
					break;
				default:
					if (key.length === 1 && key >= " " && key <= "~") {
						value += key;
						render();
					}
					break;
			}
		});

		// Cleanup on process exit
		process.on("SIGINT", () => {
			removeKeyListener();
			cancel();
		});
	});
}
