import type { SpinnerOptions } from "../../../prompt/src/types.js";
import { colors } from "../../../tui/src/components/colors.js";
import { writeLine } from "../../../tui/src/components/input.js";

export interface Spinner {
	start: (message?: string) => void;
	stop: (message?: string) => void;
	update: (message: string) => void;
}

const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function spinner(options: SpinnerOptions = {}): Spinner {
	let isSpinning = false;
	let intervalId: Timer | null = null;
	let currentMessage = options.message || "";
	let frameIndex = 0;

	const start = (message?: string) => {
		if (message) {
			currentMessage = message;
		}

		if (isSpinning) {
			return;
		}

		isSpinning = true;

		// Clear the line and start spinning
		if (process?.stdout) {
			process.stdout.write("\u001b[2K\u001b[0G");
		}

		intervalId = setInterval(() => {
			if (!isSpinning) return;

			const frame = frames[frameIndex % frames.length];
			if (process?.stdout) {
				process.stdout.write(
					`\u001b[2K\u001b[0G${colors.primary(frame)} ${colors.dim(currentMessage)}`,
				);
			}
			frameIndex++;
		}, 80);
	};

	const stop = (message?: string) => {
		if (!isSpinning) return;

		isSpinning = false;

		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}

		// Clear the spinner line
		if (process?.stdout) {
			process.stdout.write("\u001b[2K\u001b[0G");
		}

		if (message) {
			writeLine(`${colors.success("✓")} ${colors.dim(message)}`);
		}
	};

	const update = (message: string) => {
		currentMessage = message;

		if (isSpinning) {
			// The interval will pick up the new message
			const frame = frames[frameIndex % frames.length];
			if (process?.stdout) {
				process.stdout.write(
					`\u001b[2K\u001b[0G${colors.primary(frame)} ${colors.dim(currentMessage)}`,
				);
			}
		}
	};

	// Cleanup on process exit
	if (typeof process !== "undefined") {
		process.on("SIGINT", () => {
			stop();
		});
	}

	return {
		start,
		stop,
		update,
	};
}
