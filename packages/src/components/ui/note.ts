import { Context, Effect, Layer, Schema } from "effect";
import { colors } from "../core/colors";
import { showComponentExample } from "../utils/examples";

// Note configuration schema with validation
const NoteOptionsSchema = Schema.Struct({
	title: Schema.String,
	body: Schema.optional(Schema.String),
});

type NoteOptionsType = Schema.Schema.Type<typeof NoteOptionsSchema>;

export interface NoteOptions {
	title: string;
	body?: string;
}

// Context for Note dependencies
interface NoteContext {
	readonly writeLine: (text: string) => Effect.Effect<void>;
	readonly colors: {
		readonly bold: (text: string) => string;
		readonly info: (text: string) => string;
		readonly dim: (text: string) => string;
		readonly primary: (text: string) => string;
		readonly success: (text: string) => string;
		readonly warning: (text: string) => string;
		readonly error: (text: string) => string;
	};
}

const NoteContext = Context.GenericTag<NoteContext>(
	"@tui/components/NoteContext",
);

const NoteContextLive = Layer.succeed(NoteContext, {
	writeLine: (text: string) => Effect.sync(() => console.log(text)),
	colors: {
		bold: colors.bold,
		info: colors.info,
		dim: colors.dim,
		primary: colors.primary,
		success: colors.success,
		warning: colors.warning,
		error: colors.error,
	},
});

/**
 * Display an informational note with optional body text
 */
export function note(
	options: NoteOptionsType,
): Effect.Effect<void, never, NoteContext> {
	return Effect.gen(function* () {
		// Parse and validate options using schema
		const parsedOptions = Schema.validateSync(NoteOptionsSchema)(options);

		const { title, body } = parsedOptions;
		const { writeLine, colors } = yield* NoteContext;

		yield* writeLine(`${colors.info("ℹ")} ${colors.bold(title)}`);
		if (body) {
			yield* writeLine(body);
		}
		yield* writeLine("");
	});
}

/**
 * Show note component examples
 */
export async function showNoteExamples(): Promise<void> {
	await showComponentExample(
		"note",
		async () => {
			await note({
				title: "Important Information",
				body: "This is a note with additional details about the current operation.",
			})
				.pipe(Effect.provide(NoteContextLive))
				.pipe(Effect.runPromise);

			await note({
				title: "Quick Tip",
			})
				.pipe(Effect.provide(NoteContextLive))
				.pipe(Effect.runPromise);

			await note({
				title: "Configuration Required",
				body: "Please configure your API keys before continuing.",
			})
				.pipe(Effect.provide(NoteContextLive))
				.pipe(Effect.runPromise);
		},
		{
			title: "Information Blocks",
			description:
				"Styled information blocks with icons and optional body text",
		},
	);
}
