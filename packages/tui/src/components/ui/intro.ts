import { Context, Effect, Layer, Schema } from "effect";
import { colors } from "../core/colors";
import { showComponentExample } from "../utils/examples";

// Intro configuration schema with validation
const IntroOptionsSchema = Schema.Struct({
	title: Schema.String,
	tagLine: Schema.optional(Schema.String),
});

type IntroOptionsType = Schema.Schema.Type<typeof IntroOptionsSchema>;

export interface IntroOptions {
	title: string;
	tagLine?: string;
}

// Context for Intro dependencies
interface IntroContext {
	readonly writeLine: (text: string) => Effect.Effect<void>;
	readonly colors: {
		readonly bold: (text: string) => string;
		readonly primary: (text: string) => string;
		readonly dim: (text: string) => string;
	};
}

const IntroContext = Context.GenericTag<IntroContext>(
	"@tui/components/IntroContext",
);

const IntroContextLive = Layer.succeed(IntroContext, {
	writeLine: (text: string) => Effect.sync(() => console.log(text)),
	colors: {
		bold: colors.bold,
		primary: colors.primary,
		dim: colors.dim,
	},
});

/**
 * Display an intro message with optional tagline
 */
export function intro(
	options: IntroOptionsType,
): Effect.Effect<void, never, IntroContext> {
	return Effect.gen(function* () {
		// Parse and validate options using schema
		const parsedOptions = Schema.validateSync(IntroOptionsSchema)(options);

		const { title, tagLine } = parsedOptions;
		const { writeLine, colors } = yield* IntroContext;

		yield* writeLine(colors.bold(colors.primary(title)));
		if (tagLine) {
			yield* writeLine(colors.dim(tagLine));
		}
		yield* writeLine("");
	});
}

/**
 * Display an outro message
 */
export function outro(
	message: string,
): Effect.Effect<void, never, IntroContext> {
	return Effect.gen(function* () {
		const { writeLine, colors } = yield* IntroContext;

		yield* writeLine(colors.bold(colors.primary(message)));
		yield* writeLine("");
	});
}

/**
 * Show intro component examples
 */
export async function showIntroExamples(): Promise<void> {
	await showComponentExample(
		"intro",
		async () => {
			await intro({
				title: "🚀 TUI Library",
				tagLine: "Beautiful CLI components for Node.js",
			})
				.pipe(Effect.provide(IntroContextLive))
				.pipe(Effect.runPromise);

			await intro({
				title: "📦 Package Manager",
			})
				.pipe(Effect.provide(IntroContextLive))
				.pipe(Effect.runPromise);

			await outro("Thanks for using TUI Library! ✨")
				.pipe(Effect.provide(IntroContextLive))
				.pipe(Effect.runPromise);
		},
		{
			title: "Welcome & Farewell Messages",
			description: "Beautiful intro and outro messages with optional taglines",
		},
	);
}
