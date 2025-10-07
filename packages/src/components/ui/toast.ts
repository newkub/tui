import { Context, Effect, Layer, Schema } from "effect";
import { colors } from "../core/colors";
import { SYMBOLS } from "../core/constants";
import { writeLine } from "../core/input";
import { showComponentExample } from "../utils/examples";

// Toast configuration schema with validation
const ToastOptionsSchema = Schema.Struct({
	message: Schema.String,
	type: Schema.Literal("info", "success", "warning", "error"),
	duration: Schema.Number,
	autoDismiss: Schema.Boolean,
});

type ToastOptionsType = Schema.Schema.Type<typeof ToastOptionsSchema>;

export interface ToastOptions {
	/** Toast message */
	message: string;
	/** Toast type */
	type?: "info" | "success" | "warning" | "error";
	/** Duration in milliseconds (default: 3000) */
	duration?: number;
	/** Auto dismiss toast */
	autoDismiss?: boolean;
}

// Context for Toast dependencies
interface ToastContext {
	readonly writeLine: (text: string) => Effect.Effect<void>;
	readonly colors: {
		readonly info: (text: string) => string;
		readonly success: (text: string) => string;
		readonly warning: (text: string) => string;
		readonly error: (text: string) => string;
	};
	readonly symbols: {
		readonly info: string;
		readonly success: string;
		readonly warning: string;
		readonly error: string;
	};
}

const ToastContext = Context.GenericTag<ToastContext>(
	"@tui/components/ToastContext",
);

const ToastContextLive = Layer.succeed(ToastContext, {
	writeLine: (text: string) => Effect.sync(() => writeLine(text)),
	colors: {
		info: colors.info,
		success: colors.success,
		warning: colors.warning,
		error: colors.error,
	},
	symbols: {
		info: SYMBOLS.INFO,
		success: SYMBOLS.CHECKMARK,
		warning: SYMBOLS.WARNING,
		error: SYMBOLS.CROSS,
	},
});

/**
 * Display a toast notification message
 */
export function toast(
	options: ToastOptionsType,
): Effect.Effect<void, never, ToastContext> {
	return Effect.gen(function* () {
		// Parse and validate options using schema with error handling
		const parsedOptions = Schema.validateSync(ToastOptionsSchema)(options);

		const {
			message,
			type = "info",
			duration = 3000,
			autoDismiss = true,
		} = parsedOptions;

		const { writeLine, colors, symbols } = yield* ToastContext;

		const config = {
			info: { color: colors.info, symbol: symbols.info },
			success: { color: colors.success, symbol: symbols.success },
			warning: { color: colors.warning, symbol: symbols.warning },
			error: { color: colors.error, symbol: symbols.error },
		};

		const toastConfig = config[type];
		const toastLine = `${toastConfig.color(toastConfig.symbol)} ${toastConfig.color(message)}`;

		// Show toast
		yield* writeLine(`┌${"─".repeat(message.length + 4)}┐`);
		yield* writeLine(`│ ${toastLine} │`);
		yield* writeLine(`└${"─".repeat(message.length + 4)}┘`);

		// Auto dismiss
		if (autoDismiss) {
			yield* Effect.delay(
				Effect.gen(function* () {
					// Clear toast lines (3 lines)
					for (let i = 0; i < 3; i++) {
						yield* writeLine("\u001b[2K\u001b[1A\u001b[2K");
					}
				}),
				duration,
			);
		}
	});
}

/**
 * Show toast component examples
 */
export async function showToastExamples(): Promise<void> {
	await showComponentExample(
		"toast",
		async () => {
			// Example 1: Different toast types
			await toast({
				message: "Information message",
				type: "info",
				duration: 3000,
				autoDismiss: true,
			})
				.pipe(Effect.provide(ToastContextLive))
				.pipe(Effect.runPromise);
			await toast({
				message: "Success notification",
				type: "success",
				duration: 3000,
				autoDismiss: true,
			})
				.pipe(Effect.provide(ToastContextLive))
				.pipe(Effect.runPromise);
			await toast({
				message: "Warning message",
				type: "warning",
				duration: 3000,
				autoDismiss: true,
			})
				.pipe(Effect.provide(ToastContextLive))
				.pipe(Effect.runPromise);
			await toast({
				message: "Error notification",
				type: "error",
				duration: 3000,
				autoDismiss: true,
			})
				.pipe(Effect.provide(ToastContextLive))
				.pipe(Effect.runPromise);

			// Example 2: Custom duration
			await toast({
				message: "This toast will stay longer",
				type: "info",
				duration: 5000,
				autoDismiss: true,
			})
				.pipe(Effect.provide(ToastContextLive))
				.pipe(Effect.runPromise);

			// Example 3: Non-dismissing toast
			await toast({
				message: "This toast won't auto-dismiss",
				type: "warning",
				duration: 3000,
				autoDismiss: false,
			})
				.pipe(Effect.provide(ToastContextLive))
				.pipe(Effect.runPromise);
		},
		{
			title: "Toast Notifications",
			description:
				"Temporary notification messages with different types and durations",
		},
	);
}

// Run examples if this file is executed directly
if (import.meta.main) {
	showToastExamples().catch(console.error);
}
