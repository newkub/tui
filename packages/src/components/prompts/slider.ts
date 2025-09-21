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
import { clamp } from "../core/utils";

export interface SliderOptions {
	/** Prompt message */
	message: string;
	/** Minimum value */
	min: number;
	/** Maximum value */
	max: number;
	/** Initial value */
	initialValue?: number;
	/** Step size */
	step?: number;
	/** Slider width in characters */
	width?: number;
	/** Show value labels */
	showValue?: boolean;
	/** Custom formatter for value display */
	formatter?: (value: number) => string;
}

/**
 * Interactive slider for selecting numeric values
 */
export async function slider(
	options: SliderOptions,
): Promise<PromptResult<number>> {
	const {
		message,
		min,
		max,
		initialValue = Math.floor((min + max) / 2),
		step = 1,
		width = 30,
		showValue = true,
		formatter = (value: number) => String(value),
	} = options;

	return new Promise((resolve) => {
		let currentValue = clamp(initialValue, min, max);
		const input = new InputHandler();

		const render = () => {
			clearLine();
			writeLine(colors.primary(message));
			writeLine();

			// Calculate slider position
			const range = max - min;
			const position = Math.round(((currentValue - min) / range) * (width - 1));

			// Create slider bar
			const slider = Array(width)
				.fill("─")
				.map((char, index) => {
					if (index === position) return "●";
					if (index < position) return "█";
					return char;
				})
				.join("");

			// Display slider
			writeLine(
				`${colors.dim(String(min).padStart(6))} ${colors.primary(slider)} ${colors.dim(String(max).padEnd(6))}`,
			);

			if (showValue) {
				const valueStr = formatter(currentValue);
				const valuePosition = Math.max(
					0,
					Math.min(
						position - Math.floor(valueStr.length / 2),
						width - valueStr.length,
					),
				);
				const padding = " ".repeat(8 + valuePosition); // 6 for min label + 2 for spaces
				writeLine(`${padding}${colors.bold(colors.success(valueStr))}`);
			}

			writeLine();
			writeLine(
				colors.dim("Use ← → arrows to adjust, Enter to confirm, Esc to cancel"),
			);
		};

		const cleanup = () => {
			showCursor();
			input.cleanup();
		};

		const submit = () => {
			cleanup();
			resolve(currentValue);
		};

		const cancel = () => {
			cleanup();
			resolve(CANCEL_SYMBOL);
		};

		hideCursor();
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

			if (key === "left") {
				currentValue = clamp(currentValue - step, min, max);
				render();
				return;
			}

			if (key === "right") {
				currentValue = clamp(currentValue + step, min, max);
				render();
				return;
			}
		});

		// Cleanup on process exit
		process.on("SIGINT", () => {
			removeKeyListener();
			cancel();
		});
	});
}
