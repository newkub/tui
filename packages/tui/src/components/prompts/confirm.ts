import type { ConfirmOptions, PromptResult } from "../../types.js";
import { CANCEL_SYMBOL } from "../../types.js";
import { colors, formatMessage } from "../core/colors";
import {
	clearLine,
	hideCursor,
	InputHandler,
	showCursor,
	write,
	writeLine,
} from "../core/input";

export function confirm(
	options: ConfirmOptions,
): Promise<PromptResult<boolean>> {
	return new Promise((resolve) => {
		let value = options.initialValue ?? true;
		const input = new InputHandler();

		const render = () => {
			clearLine();

			const message = formatMessage(options.message);
			const yesNo = value
				? `${colors.primary("Yes")} / ${colors.dim("No")}`
				: `${colors.dim("Yes")} / ${colors.primary("No")}`;

			write(`${message} ${colors.dim("(y/N)")} ${yesNo}`);
		};

		const cleanup = () => {
			showCursor();
			input.cleanup();
		};

		const submit = () => {
			cleanup();
			clearLine();
			const answer = value ? "Yes" : "No";
			writeLine(formatMessage(options.message) + " " + colors.dim(answer));
			resolve(value);
		};

		const cancel = () => {
			cleanup();
			clearLine();
			writeLine(formatMessage(options.message) + " " + colors.dim("cancelled"));
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
				case "left":
				case "right":
				case "up":
				case "down":
					value = !value;
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
