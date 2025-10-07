import { Context, Effect, Layer, Schema } from "effect";
import { colors } from "../core/colors";
import { writeLine } from "../core/input";
import { showComponentExample } from "../utils/examples";

// Panel configuration schema with validation
const PanelOptionsSchema = Schema.Struct({
	title: Schema.optional(Schema.String),
	content: Schema.String,
	border: Schema.Literal("single", "double", "rounded", "thick"),
	width: Schema.optional(Schema.Number),
});

type PanelOptionsType = Schema.Schema.Type<typeof PanelOptionsSchema>;

export interface PanelOptions {
	/** Panel title */
	title?: string;
	/** Panel content */
	content: string;
	/** Panel border style */
	border?: "single" | "double" | "rounded" | "thick";
	/** Panel width (default: auto) */
	width?: number;
	/** Title color */
	titleColor?: (text: string) => string;
	/** Content color */
	contentColor?: (text: string) => string;
	/** Border color */
	borderColor?: (text: string) => string;
}

// Context for Panel dependencies
interface PanelContext {
	readonly writeLine: (text: string) => Effect.Effect<void>;
	readonly colors: {
		readonly primary: (text: string) => string;
		readonly dim: (text: string) => string;
		readonly info: (text: string) => string;
		readonly success: (text: string) => string;
		readonly warning: (text: string) => string;
		readonly error: (text: string) => string;
	};
}

const PanelContext = Context.GenericTag<PanelContext>(
	"@tui/components/PanelContext",
);

const PanelContextLive = Layer.succeed(PanelContext, {
	writeLine: (text: string) => Effect.sync(() => writeLine(text)),
	colors: {
		primary: colors.primary,
		dim: colors.dim,
		info: colors.info,
		success: colors.success,
		warning: colors.warning,
		error: colors.error,
	},
});

/**
 * Display content in a bordered panel/box
 */
export function panel(
	options: PanelOptionsType,
): Effect.Effect<void, never, PanelContext> {
	return Effect.gen(function* () {
		// Parse and validate options using schema
		const parsedOptions = Schema.validateSync(PanelOptionsSchema)(options);

		const { title, content, border = "single", width } = parsedOptions;

		const { writeLine, colors } = yield* PanelContext;

		const lines = content.split("\n");
		const maxLineLength = Math.max(...lines.map((line) => line.length));
		const titleLength = title ? title.length : 0;
		const panelWidth = width || Math.max(maxLineLength, titleLength) + 4;
		const contentWidth = panelWidth - 2;

		// Border characters
		const borderChars = {
			single: { h: "─", v: "│", tl: "┌", tr: "┐", bl: "└", br: "┘" },
			double: { h: "═", v: "║", tl: "╔", tr: "╗", bl: "╚", br: "╝" },
			rounded: { h: "─", v: "│", tl: "╭", tr: "╮", bl: "╰", br: "╯" },
			thick: { h: "━", v: "┃", tl: "┏", tr: "┓", bl: "┗", br: "┛" },
		};

		const chars = borderChars[border];

		// Use default colors if not provided in options
		const titleColor = colors.primary;
		const contentColor = (text: string) => text;
		const borderColor = colors.dim;

		// Top border
		if (title) {
			const titlePadding = Math.max(0, contentWidth - titleLength - 2);
			const leftPadding = Math.floor(titlePadding / 2);
			const rightPadding = titlePadding - leftPadding;

			yield* writeLine(
				borderColor(
					`${chars.tl}${chars.h.repeat(leftPadding)} ${titleColor(title)} ${chars.h.repeat(rightPadding)}${chars.tr}`,
				),
			);
		} else {
			yield* writeLine(
				borderColor(`${chars.tl}${chars.h.repeat(contentWidth)}${chars.tr}`),
			);
		}

		// Content lines
		for (const line of lines) {
			const paddedLine =
				line + " ".repeat(Math.max(0, contentWidth - line.length));
			yield* writeLine(
				borderColor(chars.v) + contentColor(paddedLine) + borderColor(chars.v),
			);
		}

		// Bottom border
		yield* writeLine(
			borderColor(`${chars.bl}${chars.h.repeat(contentWidth)}${chars.br}`),
		);
		yield* writeLine(""); // Empty line after panel
	});
}
export async function showPanelExamples(): Promise<void> {
	await showComponentExample(
		"panel",
		async () => {
			// Example 1: Basic panel
			await panel({
				title: "Information",
				content: "This is a simple panel with a title and content.",
				border: "single",
			})
				.pipe(Effect.provide(PanelContextLive))
				.pipe(Effect.runPromise);

			// Example 2: Different border styles
			await panel({
				title: "Double Border",
				content:
					"This panel uses double border style for a more prominent look.",
				border: "double",
			})
				.pipe(Effect.provide(PanelContextLive))
				.pipe(Effect.runPromise);

			await panel({
				title: "Rounded Border",
				content: "This panel uses rounded corners for a softer appearance.",
				border: "rounded",
			})
				.pipe(Effect.provide(PanelContextLive))
				.pipe(Effect.runPromise);

			// Example 3: Custom colors and width
			await panel({
				title: "Custom Styled Panel",
				content: "This panel has custom colors and a specific width.",
				width: 50,
				border: "double",
			})
				.pipe(Effect.provide(PanelContextLive))
				.pipe(Effect.runPromise);

			// Example 4: Multi-line content
			await panel({
				title: "Multi-line Content",
				content:
					"This is the first line of content.\nThis is the second line.\nAnd this is the third line with more text to show how the panel handles multiple lines.",
				border: "thick",
			})
				.pipe(Effect.provide(PanelContextLive))
				.pipe(Effect.runPromise);
		},
		{
			title: "Panel Display",
			description:
				"Display content in bordered panels with various styles and customization options",
		},
	);
}

// Run examples if this file is executed directly
if (import.meta.main) {
	showPanelExamples().catch(console.error);
}
