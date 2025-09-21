import type { PromptResult, SelectOptions } from "../../types.js";
import { CANCEL_SYMBOL } from "../../types.js";
import { colors, formatMessage, formatOption } from "../core/colors";
import {
	clearLine,
	hideCursor,
	InputHandler,
	showCursor,
	write,
	writeLine,
} from "../core/input";

export function select<T>(options: SelectOptions<T>): Promise<PromptResult<T>> {
	return new Promise((resolve) => {
		let selectedIndex = 0;

		// Find initial value index if provided
		if (options.initialValue !== undefined) {
			const foundIndex = options.options.findIndex(
				(opt) => opt.value === options.initialValue,
			);
			if (foundIndex !== -1) {
				selectedIndex = foundIndex;
			}
		}

		const input = new InputHandler();

		const render = () => {
			clearLine();

			const message = formatMessage(options.message);
			write(`${message}\n`);

			for (let i = 0; i < options.options.length; i++) {
				const option = options.options[i];
				const isSelected = i === selectedIndex;
				const formattedOption = formatOption(option.label, isSelected);

				write(formattedOption);

				if (option.hint && isSelected) {
					write(` ${colors.dim(option.hint)}`);
				}

				if (i < options.options.length - 1) {
					write("\n");
				}
			}
		};

		const cleanup = () => {
			showCursor();
			input.cleanup();
		};

		const submit = () => {
			const selectedOption = options.options[selectedIndex];
			cleanup();

			// Clear all lines
			for (let i = 0; i <= options.options.length; i++) {
				clearLine();
				if (i < options.options.length) {
					write("\u001b[1A"); // Move cursor up one line
				}
			}

			writeLine(
				`${formatMessage(options.message)} ${colors.dim(selectedOption.label)}`,
			);
			resolve(selectedOption.value);
		};

		const cancel = () => {
			cleanup();

			// Clear all lines
			for (let i = 0; i <= options.options.length; i++) {
				clearLine();
				if (i < options.options.length) {
					write("\u001b[1A"); // Move cursor up one line
				}
			}

			writeLine(`${formatMessage(options.message)} ${colors.dim("cancelled")}`);
			resolve(CANCEL_SYMBOL);
		};

		hideCursor();
		render();

		const removeKeyListener = input.onKey((key) => {
			switch (key) {
				case "ctrl+c":
					cancel();
					break;
				case "enter":
					submit();
					break;
				case "up":
					selectedIndex =
						selectedIndex > 0 ? selectedIndex - 1 : options.options.length - 1;
					render();
					break;
				case "down":
					selectedIndex =
						selectedIndex < options.options.length - 1 ? selectedIndex + 1 : 0;
					render();
					break;
				case "escape":
					cancel();
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
