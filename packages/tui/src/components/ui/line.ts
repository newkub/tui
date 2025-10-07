import { Context, Effect, Layer, Schema } from "effect";
import { colors } from "../core/colors";
import { SYMBOLS } from "../core/constants";
import { showComponentExample } from "../utils/examples";

// Line configuration schema with validation
const LineOptionsSchema = Schema.Struct({
	title: Schema.optional(Schema.String),
	char: Schema.optional(Schema.String),
	width: Schema.optional(Schema.Number),
	style: Schema.optional(Schema.Literal("solid", "dashed", "dotted", "double")),
});

type LineOptionsType = Schema.Schema.Type<typeof LineOptionsSchema>;

export interface LineOptions {
	/** Title text to display in the center of the line */
	title?: string;
	/** Character to use for the line (default: horizontal line) */
	char?: string;
	/** Width of the line (default: 60) */
	width?: number;
	/** Color function to apply to the line */
	color?: (text: string) => string;
	/** Style of the line */
	style?: "solid" | "dashed" | "dotted" | "double";
}

// Context for Line dependencies
interface LineContext {
	readonly writeLine: (text: string) => Effect.Effect<void>;
	readonly colors: {
		readonly primary: (text: string) => string;
		readonly dim: (text: string) => string;
		readonly info: (text: string) => string;
		readonly success: (text: string) => string;
		readonly warning: (text: string) => string;
		readonly error: (text: string) => string;
	};
	readonly symbols: {
		readonly horizontalLine: string;
	};
}

const LineContext = Context.GenericTag<LineContext>(
	"@tui/components/LineContext",
);

const LineContextLive = Layer.succeed(LineContext, {
	writeLine: (text: string) => Effect.sync(() => console.log(text)),
	colors: {
		primary: colors.primary,
		dim: colors.dim,
		info: colors.info,
		success: colors.success,
		warning: colors.warning,
		error: colors.error,
	},
	symbols: {
		horizontalLine: SYMBOLS.HORIZONTAL_LINE,
	},
});

/**
 * Display a horizontal line separator with optional title
 */
export function line(
	options: LineOptionsType = {},
): Effect.Effect<void, never, LineContext> {
	return Effect.gen(function* () {
		// Parse and validate options using schema
		const parsedOptions = Schema.validateSync(LineOptionsSchema)(options);

		const {
			title,
			char = SYMBOLS.HORIZONTAL_LINE,
			width = 60,
			style = "solid",
		} = parsedOptions;

		const { writeLine, colors } = yield* LineContext;

		let lineChar = char;

		// Apply style variations
		if (style === "dashed") {
			lineChar = "─";
		} else if (style === "dotted") {
			lineChar = "·";
		}

		// Use default color if not provided in options
		const colorFn = colors.dim;

		if (title) {
			const titleLength = title.length;
			const padding = Math.max(2, Math.floor((width - titleLength - 2) / 2));
			const leftLine = lineChar.repeat(padding);
			const rightLine = lineChar.repeat(width - padding - titleLength - 2);

			yield* writeLine(colorFn(`${leftLine} ${title} ${rightLine}`));
		} else {
			yield* writeLine(colorFn(lineChar.repeat(width)));
		}
	});
}

/**
 * Display a section separator with title
 */
export function section(
	title: string,
	options: Omit<LineOptionsType, "title"> = {},
): Effect.Effect<void, never, LineContext> {
	return line({ ...options, title });
}

/**
 * Display a simple divider
 */
export function divider(
	options: Omit<LineOptionsType, "title"> = {},
): Effect.Effect<void, never, LineContext> {
	return line({ ...options, char: "─" });
}

/**
 * Show line component examples
 */
export async function showLineExamples(): Promise<void> {
	await showComponentExample(
		"line",
		async () => {
			// Example 1: Basic line styles
			await line({ title: "Basic Lines" })
				.pipe(Effect.provide(LineContextLive))
				.pipe(Effect.runPromise);
			await line({ style: "solid", width: 50 })
				.pipe(Effect.provide(LineContextLive))
				.pipe(Effect.runPromise);
			await line({ style: "dashed", width: 40 })
				.pipe(Effect.provide(LineContextLive))
				.pipe(Effect.runPromise);
			await line({ style: "dotted", width: 30 })
				.pipe(Effect.provide(LineContextLive))
				.pipe(Effect.runPromise);

			// Example 2: Section separators
			await section("Getting Started", { style: "solid", width: 60 })
				.pipe(Effect.provide(LineContextLive))
				.pipe(Effect.runPromise);
			await section("Configuration", { style: "double", width: 50 })
				.pipe(Effect.provide(LineContextLive))
				.pipe(Effect.runPromise);
			await section("Examples", { style: "dashed", width: 40 })
				.pipe(Effect.provide(LineContextLive))
				.pipe(Effect.runPromise);

			// Example 3: Simple dividers
			await divider({ width: 60 })
				.pipe(Effect.provide(LineContextLive))
				.pipe(Effect.runPromise);
			await divider({ style: "dashed", width: 50 })
				.pipe(Effect.provide(LineContextLive))
				.pipe(Effect.runPromise);
			await divider({ style: "dotted", width: 40 })
				.pipe(Effect.provide(LineContextLive))
				.pipe(Effect.runPromise);

			// Example 4: Custom characters and colors
			await line({
				char: "═",
				width: 55,
				title: "Custom Styled Line",
			})
				.pipe(Effect.provide(LineContextLive))
				.pipe(Effect.runPromise);

			await line({
				char: "*",
				width: 45,
				title: "Star Line",
			})
				.pipe(Effect.provide(LineContextLive))
				.pipe(Effect.runPromise);
		},
		{
			title: "Line Separators",
			description:
				"Display horizontal lines, section dividers, and decorative separators with various styles",
		},
	);
}

// Run examples if this file is executed directly
if (import.meta.main) {
	showLineExamples().catch(console.error);
}
