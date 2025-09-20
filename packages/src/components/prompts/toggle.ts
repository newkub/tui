import { CANCEL_SYMBOL } from "../../types.js";
import { colors, formatMessage } from "../core/colors.js";
import {
	clearLine,
	hideCursor,
	InputHandler,
	showCursor,
	write,
	writeLine,
} from "../core/input.js";
import type { PromptResult, ToggleOptions } from "./types.js";

export function toggle(options: ToggleOptions): Promise<PromptResult<boolean>> {
	return new Promise((resolve) => {
		let value = options.defaultValue ?? false;
		const active = options.active ?? "Yes";
		const inactive = options.inactive ?? "No";
		const input = new InputHandler();

		const render = () => {
			clearLine();

			const message = formatMessage(options.message);
			const toggle = value
				? `${colors.primary("●")} ${colors.primary(active)}`
				: `${colors.dim("○")} ${colors.dim(inactive)}`;

			write(`${message} ${toggle}`);
		};

		const cleanup = () => {
			showCursor();
			input.cleanup();
		};

		const submit = () => {
			cleanup();
			clearLine();
			const result = value ? active : inactive;
			writeLine(`${formatMessage(options.message)} ${colors.dim(result)}`);
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
			switch (key) {
				case "ctrl+c":
					cancel();
					break;
				case "enter":
				case "space":
					submit();
					break;
				case "left":
				case "right":
				case "up":
				case "down":
					value = !value;
					render();
					break;
				case "y":
				case "Y":
					value = true;
					render();
					break;
				case "n":
				case "N":
					value = false;
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
