import { Context, Effect, Layer, Schema } from "effect";
import { colors } from "../core/colors";
import { writeLine } from "../core/input";
import type { ProgressOptions } from "../core/types";
import { clamp } from "../core/utils";
import { showComponentExample } from "../utils/examples";

// Progress configuration schema with validation
const ProgressOptionsSchema = Schema.Struct({
	message: Schema.String,
	current: Schema.Number,
	total: Schema.Number,
});

type ProgressOptionsType = Schema.Schema.Type<typeof ProgressOptionsSchema>;

export interface ProgressBar {
	update: (options: ProgressOptions) => Effect.Effect<void>;
	stop: () => Effect.Effect<void>;
}

const BAR_WIDTH = 40;

// Context for Progress dependencies
interface ProgressContext {
	readonly writeLine: (text: string) => Effect.Effect<void>;
	readonly colors: {
		readonly primary: (text: string) => string;
		readonly dim: (text: string) => string;
		readonly success: (text: string) => string;
	};
}

const ProgressContext = Context.GenericTag<ProgressContext>(
	"@tui/components/ProgressContext",
);

const ProgressContextLive = Layer.succeed(ProgressContext, {
	writeLine: (text: string) => Effect.sync(() => writeLine(text)),
	colors: {
		primary: colors.primary,
		dim: colors.dim,
		success: colors.success,
	},
});

const makeProgressService = (
	options: ProgressOptionsType = { message: "", current: 0, total: 100 },
): Effect.Effect<ProgressBar, never, never> => {
	return Effect.sync(() => {
		// Parse and validate options using schema with error handling
		const parsedOptions = Schema.validateSync(ProgressOptionsSchema)(options);

		let current = parsedOptions.current;
		let total = parsedOptions.total;
		let message = parsedOptions.message;

		const render = (): Effect.Effect<void> => {
			const percentage = Math.round((current / total) * 100);
			const filled = Math.round((current / total) * BAR_WIDTH);
			const empty = BAR_WIDTH - filled;

			const bar = "█".repeat(filled) + "░".repeat(empty);
			const progressText = `${percentage}%`;

			const line = `${colors.primary("▓")} ${colors.dim(message)} ${colors.primary(progressText)}`;
			const barLine = `${colors.primary("│")} ${colors.primary("[")}${bar}${colors.primary("]")}`;

			return Effect.all(
				[
					Effect.sync(() => writeLine(line)),
					Effect.sync(() => writeLine(barLine)),
				],
				{ concurrency: "unbounded" },
			).pipe(Effect.map(() => undefined));
		};

		const update = (options: ProgressOptions): Effect.Effect<void> => {
			return Effect.sync(() => {
				if (options.message !== undefined) message = options.message;
				if (options.current !== undefined) current = options.current;
				if (options.total !== undefined) total = options.total;

				current = clamp(current, 0, total);
			}).pipe(Effect.flatMap(() => render()));
		};

		const stop = (): Effect.Effect<void> => {
			return Effect.sync(() => {
				for (let i = 0; i < 2; i++) {
					writeLine("\u001b[2K\u001b[1A\u001b[2K");
				}
			});
		};

		return { update, stop };
	}).pipe(
		Effect.map((progressObj) => {
			// Transform to match ProgressBar interface exactly
			const transformedProgress: ProgressBar = {
				update: progressObj.update,
				stop: progressObj.stop,
			};
			return transformedProgress;
		}),
	);
};

export function progress(
	options: ProgressOptionsType = { message: "", current: 0, total: 100 },
): Effect.Effect<ProgressBar, never, never> {
	return makeProgressService(options);
}

/**
 * Show progress component examples
 */
export async function showProgressExamples(): Promise<void> {
	await showComponentExample(
		"progress",
		async () => {
			// Example 1: Basic progress bar
			console.log("🚀 Simulating file download...");
			const progressBarEffect = progress();

			const progressBar = await progressBarEffect.pipe(Effect.runPromise);

			const tasks = [
				"Connecting to server...",
				"Downloading files...",
				"Extracting archive...",
				"Installing dependencies...",
				"Finalizing setup...",
			];

			for (let i = 0; i <= 100; i += 20) {
				const taskIndex = Math.floor(i / 20);
				await progressBar
					.update({
						message: tasks[taskIndex] || "Complete!",
						current: i,
						total: 100,
					})
					.pipe(Effect.runPromise);
				await new Promise((resolve) => setTimeout(resolve, 400));
			}
			await progressBar.stop().pipe(Effect.runPromise);

			console.log("✅ Download completed successfully!\n");

			// Example 2: Custom progress ranges
			console.log("📊 Processing data in chunks...");
			const progressBar2Effect = progress();

			const progressBar2 = await progressBar2Effect.pipe(Effect.runPromise);

			for (let i = 0; i <= 250; i += 50) {
				await progressBar2
					.update({
						message: `Processing chunk ${Math.floor(i / 50) + 1}/5`,
						current: i,
						total: 250,
					})
					.pipe(Effect.runPromise);
				await new Promise((resolve) => setTimeout(resolve, 300));
			}
			await progressBar2.stop().pipe(Effect.runPromise);

			console.log("✅ Data processing completed!\n");

			// Example 3: Indeterminate progress simulation
			console.log("🔄 Running background tasks...");
			const progressBar3Effect = progress();

			const progressBar3 = await progressBar3Effect.pipe(Effect.runPromise);

			const bgTasks = [
				"Validating data...",
				"Optimizing performance...",
				"Updating cache...",
				"Syncing files...",
			];

			for (let i = 0; i < bgTasks.length; i++) {
				await progressBar3
					.update({
						message: bgTasks[i] || "Processing...",
						current: (i + 1) * 25,
						total: 100,
					})
					.pipe(Effect.runPromise);
				await new Promise((resolve) => setTimeout(resolve, 600));
			}
			await progressBar3.stop().pipe(Effect.runPromise);

			console.log("✅ Background tasks completed!\n");
		},
		{
			title: "Progress Bars",
			description:
				"Interactive progress bars for tracking long-running operations with visual feedback",
		},
	);
}

// Run examples if this file is executed directly
if (import.meta.main) {
	showProgressExamples().catch(console.error);
}
