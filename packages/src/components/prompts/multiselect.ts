import type { MultiSelectOptions, PromptResult } from "../../types.js";
import { CANCEL_SYMBOL } from "../../types.js";
import { colors, formatMessage, formatMultiOption } from "../core/colors";
import {
	clearLine,
	hideCursor,
	InputHandler,
	showCursor,
	write,
	writeLine,
} from "../core/input";

export function multiselect<T>(
	options: MultiSelectOptions<T>,
): Promise<PromptResult<T[]>> {
	return new Promise((resolve) => {
		let selectedValues: T[] = options.initialValues || [];
		let selectedIndex = 0;
		const input = new InputHandler();

		const render = () => {
			clearLine();

			const message = formatMessage(options.message);
			write(message + "\n");

			for (let i = 0; i < options.options.length; i++) {
				const option = options.options[i];
				const isSelected = i === selectedIndex;
				const isChecked = selectedValues.includes(option.value);

				const formattedOption = formatMultiOption(
					option.label,
					isSelected,
					isChecked,
				);

				write(formattedOption);

				if (option.hint && isSelected) {
					write(" " + colors.dim(option.hint));
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
			cleanup();

			// Clear all lines
			for (let i = 0; i <= options.options.length; i++) {
				clearLine();
				if (i < options.options.length) {
					write("\u001b[1A"); // Move cursor up one line
				}
			}

			if (selectedValues.length === 0 && options.required) {
				writeLine(
					formatMessage(options.message) +
						" " +
						colors.error("Please select at least one option"),
				);
				return;
			}

			const selectedLabels = selectedValues
				.map(
					(value) => options.options.find((opt) => opt.value === value)?.label,
				)
				.filter(Boolean);

			writeLine(
				formatMessage(options.message) +
					" " +
					colors.dim(selectedLabels.join(", ")),
			);
			resolve(selectedValues);
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

			writeLine(formatMessage(options.message) + " " + colors.dim("cancelled"));
			resolve(CANCEL_SYMBOL);
		};

		const toggleSelection = () => {
			const option = options.options[selectedIndex];
			const isCurrentlySelected = selectedValues.includes(option.value);

			if (isCurrentlySelected) {
				selectedValues = selectedValues.filter(
					(value) => value !== option.value,
				);
			} else {
				selectedValues.push(option.value);
			}

			render();
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
				case "space":
					toggleSelection();
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
