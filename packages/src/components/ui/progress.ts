import type { ProgressOptions } from "../../types.js";
import { colors } from "../core/colors";
import { writeLine } from "../core/input";
import { clamp } from "../core/utils";

export interface ProgressBar {
	update: (options: ProgressOptions) => void;
	stop: () => void;
}

const BAR_WIDTH = 40;

export function progress(): ProgressBar {
	let current = 0;
	let total = 100;
	let message = "";

	const render = () => {
		const percentage = Math.round((current / total) * 100);
		const filled = Math.round((current / total) * BAR_WIDTH);
		const empty = BAR_WIDTH - filled;

		const bar = "█".repeat(filled) + "░".repeat(empty);
		const progressText = `${percentage}%`;

		const line = `${colors.primary("▓")} ${colors.dim(message)} ${colors.primary(progressText)}`;
		const barLine = `${colors.primary("│")} ${colors.primary("[")}${bar}${colors.primary("]")}`;

		writeLine(line);
		writeLine(barLine);
	};

	const update = (options: ProgressOptions) => {
		if (options.message) message = options.message;
		if (options.current !== undefined) current = options.current;
		if (options.total !== undefined) total = options.total;

		current = clamp(current, 0, total);
		render();
	};

	const stop = () => {
		// Clear progress lines
		for (let i = 0; i < 2; i++) {
			writeLine("\u001b[2K\u001b[1A\u001b[2K");
		}
	};

	return {
		update,
		stop,
	};
}
