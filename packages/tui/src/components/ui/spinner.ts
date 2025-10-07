import { Context, Effect, Layer, Schema } from "effect";
import { colors } from "../core/colors";
import { clearLine, write, writeLine } from "../core/input";
import { showComponentExample } from "../utils/examples";

// Spinner frame characters for animation
const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;

// Spinner configuration schema with validation
const SpinnerOptionsSchema = Schema.Struct({
	message: Schema.optional(Schema.String),
});

type SpinnerOptionsType = Schema.Schema.Type<typeof SpinnerOptionsSchema>;

// Spinner interface
export interface Spinner {
	readonly start: (message?: string) => Effect.Effect<void, never, never>;
	readonly stop: (message?: string) => Effect.Effect<void, never, never>;
	readonly update: (message: string) => Effect.Effect<void, never, never>;
}

// Context for Spinner dependencies
interface SpinnerContext {
	readonly writeLine: (text: string) => Effect.Effect<void, never, never>;
	readonly clearLine: () => Effect.Effect<void, never, never>;
	readonly write: (text: string) => Effect.Effect<void, never, never>;
	readonly colors: {
		readonly primary: (text: string) => string;
		readonly dim: (text: string) => string;
		readonly success: (text: string) => string;
	};
	readonly frames: readonly string[];
}

const SpinnerContext = Context.GenericTag<SpinnerContext>(
	"@tui/components/SpinnerContext",
);

const SpinnerContextLive = Layer.succeed(SpinnerContext, {
	writeLine: (text: string) => Effect.sync(() => writeLine(text)),
	clearLine: () =>
		Effect.sync(() => {
			process.stdout?.write("\u001b[2K\u001b[0G");
		}),
	write: (text: string) =>
		Effect.sync(() => {
			process.stdout?.write(text);
		}),
	colors: {
		primary: colors.primary,
		dim: colors.dim,
		success: colors.success,
	},
	frames,
});

// Terminal service implementation (for backward compatibility)
const TerminalServiceLive = {
	writeLine: (text: string) => Effect.sync(() => writeLine(text)),
	clearLine: () =>
		Effect.sync(() => {
			process.stdout?.write("\u001b[2K\u001b[0G");
		}),
};

// Effect layer for terminal service (for backward compatibility)
export const TerminalServiceLayer = Effect.succeed(TerminalServiceLive);

export function spinner(
	options: SpinnerOptionsType = { message: "" },
): Effect.Effect<Spinner, never, never> {
	return Effect.sync(() => {
		// Parse and validate options using schema with error handling
		const parsedOptions = Schema.validateSync(SpinnerOptionsSchema)(options);

		let isSpinning = false;
		let intervalId: any = null; // Using any for compatibility with Node.js timers
		let currentMessage: string = (parsedOptions.message ?? "") as string;
		let frameIndex = 0;

		const start = (message?: string): Effect.Effect<void, never, never> => {
			return Effect.sync(() => {
				if (message !== undefined) {
					currentMessage = message;
				}

				if (isSpinning) {
					return;
				}

				isSpinning = true;

				// Clear the line and start spinning
				intervalId = setInterval(() => {
					if (!isSpinning) return;

					const frame = frames[frameIndex % frames.length] as string;
					write("\u001b[2K\u001b[0G");
					write(`${colors.primary(frame)} ${colors.dim(currentMessage)}`);
					frameIndex++;
				}, 80);
			});
		};

		const stop = (message?: string): Effect.Effect<void, never, never> => {
			return Effect.sync(() => {
				if (!isSpinning) return;

				isSpinning = false;

				if (intervalId) {
					clearInterval(intervalId);
					intervalId = null;
				}

				// Clear the spinner line
				write("\u001b[2K\u001b[0G");

				if (message !== undefined) {
					writeLine(`${colors.success("✓")} ${colors.dim(message)}`);
				}
			});
		};

		const update = (message: string): Effect.Effect<void, never, never> => {
			return Effect.sync(() => {
				currentMessage = message;

				if (isSpinning) {
					// The interval will pick up the new message
					const frame = frames[frameIndex % frames.length] as string;
					write("\u001b[2K\u001b[0G");
					write(`${colors.primary(frame)} ${colors.dim(currentMessage)}`);
				}
			});
		};

		// Cleanup on process exit
		if (typeof process !== "undefined") {
			process.on("SIGINT", () => {
				Effect.runSync(stop());
			});
		}

		return { start, stop, update };
	}).pipe(
		Effect.map((spinnerObj) => {
			// Transform to match Spinner interface exactly
			const transformedSpinner: Spinner = {
				start: spinnerObj.start,
				stop: spinnerObj.stop,
				update: spinnerObj.update,
			};
			return transformedSpinner;
		}),
	);
}

/**
 * Show spinner examples
 */
export async function showSpinnerExamples(): Promise<void> {
	await showComponentExample(
		"spinner",
		async () => {
			// Create spinner
			const spinnerEffect = spinner();

			const spin = await spinnerEffect.pipe(Effect.runPromise);

			await spin.start("Loading data...").pipe(Effect.runPromise);
			await new Promise((resolve) => setTimeout(resolve, 1500));
			await spin.update("Processing data...").pipe(Effect.runPromise);
			await new Promise((resolve) => setTimeout(resolve, 1500));
			await spin.stop("Done!").pipe(Effect.runPromise);
		},
		{
			title: "Basic Spinner",
			description: "Shows a simple loading spinner with progress updates",
		},
	);
}

// Run examples if this file is executed directly
if (import.meta.main) {
	showSpinnerExamples().catch(console.error);
}
