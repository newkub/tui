import type { PromptResult, SelectOption } from "../../types.js";
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

export interface FzfOptions<T = string> {
	message: string;
	options: SelectOption<T>[];
	initialValue?: T;
	placeholder?: string;
}

export function fzf<T>(options: FzfOptions<T>): Promise<PromptResult<T>> {
	return new Promise((resolve) => {
		let selectedIndex = 0;
		let filteredOptions = [...options.options];
		let searchTerm = "";
		let previousLinesCount = 0;

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

		// Simple fuzzy filtering function
		const filterOptions = (term: string) => {
			if (!term) return [...options.options];

			return options.options.filter((option) =>
				option.label.toLowerCase().includes(term.toLowerCase()),
			);
		};

		const clearPreviousLines = () => {
			// Clear previous lines
			for (let i = 0; i < previousLinesCount; i++) {
				clearLine();
				if (i < previousLinesCount - 1) {
					write("\u001b[1A"); // Move cursor up one line
				}
			}
			previousLinesCount = 0;
		};

		const render = () => {
			clearPreviousLines();

			const message = formatMessage(options.message);
			const placeholder = options.placeholder
				? colors.dim(`(${options.placeholder})`)
				: "";

			write(`${message} ${searchTerm}${placeholder}\n`);
			previousLinesCount = 1;

			// Display filtered options (limit to 10 for better UX)
			const displayOptions = filteredOptions.slice(0, 10);
			for (let i = 0; i < displayOptions.length; i++) {
				const option = displayOptions[i];
				const isSelected = i === selectedIndex;
				const formattedOption = formatOption(option.label, isSelected);

				write(formattedOption);

				if (option.hint && isSelected) {
					write(` ${colors.dim(option.hint)}`);
				}

				if (i < displayOptions.length - 1) {
					write("\n");
				}
			}

			previousLinesCount += displayOptions.length;

			// Show how many results
			if (
				filteredOptions.length !== options.options.length ||
				filteredOptions.length > 10
			) {
				const displayCount = Math.min(filteredOptions.length, 10);
				write(
					`\n${colors.dim(`${displayCount}/${filteredOptions.length} results`)}`,
				);
				previousLinesCount += 1;
			}
		};

		const cleanup = () => {
			showCursor();
			input.cleanup();
		};

		const submit = () => {
			if (filteredOptions.length === 0) return;

			const selectedOption = filteredOptions[selectedIndex];
			cleanup();

			// Clear all lines
			clearPreviousLines();

			writeLine(
				`${formatMessage(options.message)} ${colors.dim(selectedOption.label)}`,
			);
			resolve(selectedOption.value);
		};

		const cancel = () => {
			cleanup();

			// Clear all lines
			clearPreviousLines();

			writeLine(`${formatMessage(options.message)} ${colors.dim("cancelled")}`);
			resolve(CANCEL_SYMBOL);
		};

		hideCursor();
		render();

		const removeKeyListener = input.onKey((key, _data: any) => {
			switch (key) {
				case "ctrl+c":
					cancel();
					break;
				case "enter":
					if (filteredOptions.length > 0) {
						submit();
					}
					break;
				case "backspace":
					if (searchTerm.length > 0) {
						searchTerm = searchTerm.slice(0, -1);
						filteredOptions = filterOptions(searchTerm);
						selectedIndex = 0; // Reset to first option
						render();
					}
					break;
				case "up":
					if (filteredOptions.length > 0) {
						selectedIndex =
							selectedIndex > 0
								? selectedIndex - 1
								: filteredOptions.length - 1;
						render();
					}
					break;
				case "down":
					if (filteredOptions.length > 0) {
						selectedIndex =
							selectedIndex < filteredOptions.length - 1
								? selectedIndex + 1
								: 0;
						render();
					}
					break;
				case "escape":
					cancel();
					break;
				default:
					// Add character to search term
					if (key.length === 1 && key >= " " && key <= "~") {
						searchTerm += key;
						filteredOptions = filterOptions(searchTerm);
						selectedIndex = 0; // Reset to first option
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
