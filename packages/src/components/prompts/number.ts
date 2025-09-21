import { CANCEL_SYMBOL } from "../../types";
import { colors, formatError, formatMessage } from "../core/colors";
import {
	clearLine,
	hideCursor,
	InputHandler,
	showCursor,
	write,
	writeLine,
} from "../core/input";
import type { PromptResult } from "../../types";
import type { NumberOptions } from "../core/types";

export function number(options: NumberOptions): Promise<PromptResult<number>> {
	return new Promise((resolve) => {
		let value = options.defaultValue?.toString() || "";
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
			const numValue = parseFloat(value);

			if (value === "") {
				if (options.defaultValue !== undefined) {
					cleanup();
					clearLine();
					writeLine(
						`${formatMessage(options.message)} ${colors.dim(options.defaultValue.toString())}`,
					);
					resolve(options.defaultValue);
					return;
				}
				error = "Please enter a number";
				render();
				return;
			}

			if (Number.isNaN(numValue)) {
				error = "Please enter a valid number";
				render();
				return;
			}

			if (options.min !== undefined && numValue < options.min) {
				error = `Number must be at least ${options.min}`;
				render();
				return;
			}

			if (options.max !== undefined && numValue > options.max) {
				error = `Number must be at most ${options.max}`;
				render();
				return;
			}

			cleanup();
			clearLine();
			writeLine(
				`${formatMessage(options.message)} ${colors.dim(numValue.toString())}`,
			);
			resolve(numValue);
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
					// Allow numbers, decimal point, and negative sign
					if (/[\d.-]/.test(key) || key === "-") {
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
