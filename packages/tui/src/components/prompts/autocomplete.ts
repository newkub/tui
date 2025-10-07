import type { PromptResult } from "../../types";
import { CANCEL_SYMBOL } from "../../types";
import { colors } from "../core/colors";
import {
	clearLine,
	hideCursor,
	InputHandler,
	showCursor,
	write,
	writeLine,
} from "../core/input";

export interface AutocompleteOption {
	label: string;
	value: string;
	description?: string;
}

export interface AutocompleteOptions {
	/** Prompt message */
	message: string;
	/** Available options for autocomplete */
	options: AutocompleteOption[];
	/** Placeholder text */
	placeholder?: string;
	/** Initial value */
	initialValue?: string;
	/** Minimum characters to trigger suggestions */
	minLength?: number;
	/** Maximum suggestions to show */
	maxSuggestions?: number;
	/** Validation function */
	validate?: (value: string) => boolean | string;
}

/**
 * Text input with autocomplete suggestions
 */
export async function autocomplete(
	options: AutocompleteOptions,
): Promise<PromptResult<string>> {
	const {
		message,
		options: autocompleteOptions,
		placeholder = "Type to search...",
		initialValue = "",
		minLength = 1,
		maxSuggestions = 5,
		validate,
	} = options;

	return new Promise((resolve) => {
		let currentValue = initialValue;
		let selectedSuggestion = -1;
		let suggestions: AutocompleteOption[] = [];
		const input = new InputHandler();

		const updateSuggestions = (value: string) => {
			if (value.length < minLength) {
				suggestions = [];
				return;
			}

			suggestions = autocompleteOptions
				.filter(
					(option) =>
						option.label.toLowerCase().includes(value.toLowerCase()) ||
						option.value.toLowerCase().includes(value.toLowerCase()),
				)
				.slice(0, maxSuggestions);

			selectedSuggestion = suggestions.length > 0 ? 0 : -1;
		};

		const render = () => {
			clearLine();
			write(`${colors.primary(message)} `);

			const displayValue = currentValue || colors.dim(placeholder);
			write(displayValue);

			if (suggestions.length > 0) {
				writeLine("");
				writeLine(colors.dim("Suggestions:"));

				for (let i = 0; i < suggestions.length; i++) {
					const suggestion = suggestions[i];
					const isSelected = i === selectedSuggestion;
					const prefix = isSelected ? colors.primary("▶ ") : "  ";
					const label = isSelected
						? colors.primary(suggestion.label)
						: suggestion.label;
					const desc = suggestion.description
						? colors.dim(` - ${suggestion.description}`)
						: "";
					writeLine(`${prefix}${label}${desc}`);
				}
			}

			if (validate && currentValue) {
				const result = validate(currentValue);
				if (result !== true) {
					writeLine("");
					writeLine(
						colors.error(typeof result === "string" ? result : "Invalid input"),
					);
				}
			}
		};

		const cleanup = () => {
			showCursor();
			input.cleanup();
		};

		const submit = () => {
			let finalValue = currentValue;

			// Use selected suggestion if available
			if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
				finalValue = suggestions[selectedSuggestion].value;
			}

			// Validate final value
			if (validate) {
				const result = validate(finalValue);
				if (result !== true) {
					render();
					return;
				}
			}

			cleanup();
			resolve(finalValue);
		};

		const cancel = () => {
			cleanup();
			resolve(CANCEL_SYMBOL);
		};

		hideCursor();
		updateSuggestions(currentValue);
		render();

		const removeKeyListener = input.onKey((key: string) => {
			if (key === "ctrl+c" || key === "escape") {
				cancel();
				return;
			}

			if (key === "enter") {
				submit();
				return;
			}

			if (key === "up" && suggestions.length > 0) {
				selectedSuggestion =
					selectedSuggestion > 0
						? selectedSuggestion - 1
						: suggestions.length - 1;
				render();
				return;
			}

			if (key === "down" && suggestions.length > 0) {
				selectedSuggestion =
					selectedSuggestion < suggestions.length - 1
						? selectedSuggestion + 1
						: 0;
				render();
				return;
			}

			if (
				key === "tab" &&
				selectedSuggestion >= 0 &&
				suggestions[selectedSuggestion]
			) {
				currentValue = suggestions[selectedSuggestion].value;
				updateSuggestions(currentValue);
				render();
				return;
			}

			// Handle regular text input
			if (key === "backspace") {
				currentValue = currentValue.slice(0, -1);
			} else if (key.length === 1 && key >= " " && key <= "~") {
				currentValue += key;
			}

			updateSuggestions(currentValue);
			render();
		});

		// Cleanup on process exit
		process.on("SIGINT", () => {
			removeKeyListener();
			cancel();
		});
	});
}
