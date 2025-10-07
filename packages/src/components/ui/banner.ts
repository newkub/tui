import { Context, Effect, Layer, Schema } from "effect";
import { colors } from "../core/colors";
import { writeLine } from "../core/input";
import { showComponentExample } from "../utils/examples";

// Banner configuration schema with validation
const BannerOptionsSchema = Schema.Struct({
	text: Schema.String,
	style: Schema.Literal("simple", "bordered", "double", "rounded"),
	align: Schema.Literal("left", "center", "right"),
	width: Schema.optional(Schema.Number),
	padding: Schema.optional(Schema.Number),
});

type BannerOptionsType = Schema.Schema.Type<typeof BannerOptionsSchema>;

export interface BannerOptions {
	/** Banner text */
	text: string;
	/** Banner style */
	style?: "simple" | "bordered" | "double" | "rounded";
	/** Text alignment */
	align?: "left" | "center" | "right";
	/** Banner width (default: auto) */
	width?: number;
	/** Color function */
	color?: (text: string) => string;
	/** Padding inside banner */
	padding?: number;
}

// Context for Banner dependencies
interface BannerContext {
	readonly writeLine: (text: string) => Effect.Effect<void>;
	readonly colors: {
		readonly primary: (text: string) => string;
		readonly success: (text: string) => string;
		readonly warning: (text: string) => string;
		readonly error: (text: string) => string;
		readonly info: (text: string) => string;
		readonly dim: (text: string) => string;
	};
}

const BannerContext = Context.GenericTag<BannerContext>(
	"@tui/components/BannerContext",
);

const BannerContextLive = Layer.succeed(BannerContext, {
	writeLine: (text: string) => Effect.sync(() => writeLine(text)),
	colors: {
		primary: colors.primary,
		success: colors.success,
		warning: colors.warning,
		error: colors.error,
		info: colors.info,
		dim: colors.dim,
	},
});

/**
 * Display a banner with decorative borders
 */
export function banner(
	options: BannerOptionsType,
): Effect.Effect<void, never, BannerContext> {
	return Effect.gen(function* () {
		// Parse and validate options using schema
		const parsedOptions = Schema.validateSync(BannerOptionsSchema)(options);

		const {
			text,
			style = "bordered",
			align = "center",
			width,
			padding = 1,
		} = parsedOptions;

		const { writeLine, colors } = yield* BannerContext;

		// Validate and sanitize input values
		const safeText = String(text || "");
		const safePadding = Math.max(
			0,
			Math.min(Number.isFinite(padding) ? padding : 1, 100),
		);
		const safeWidth =
			width && Number.isFinite(width) && width > 0 ? width : undefined;

		const textLength = safeText.length;
		const bannerWidth =
			safeWidth || Math.max(textLength + safePadding * 2 + 2, 10);
		const contentWidth = Math.max(bannerWidth - 2, 0);

		let topBorder = "";
		let bottomBorder = "";
		let sideBorder = "";

		switch (style) {
			case "simple":
				topBorder = bottomBorder = "─".repeat(bannerWidth);
				sideBorder = "";
				break;
			case "bordered":
				topBorder = `┌${"─".repeat(contentWidth)}┐`;
				bottomBorder = `└${"─".repeat(contentWidth)}┘`;
				sideBorder = "│";
				break;
			case "double":
				topBorder = `╔${"═".repeat(contentWidth)}╗`;
				bottomBorder = `╚${"═".repeat(contentWidth)}╝`;
				sideBorder = "║";
				break;
			case "rounded":
				topBorder = `╭${"─".repeat(contentWidth)}╮`;
				bottomBorder = `╰${"─".repeat(contentWidth)}╯`;
				sideBorder = "│";
				break;
		}

		// Calculate text position
		let alignedText = safeText;
		if (align === "center") {
			const spaces = Math.max(0, Math.floor((contentWidth - textLength) / 2));
			alignedText =
				" ".repeat(spaces) +
				safeText +
				" ".repeat(Math.max(0, contentWidth - spaces - textLength));
		} else if (align === "right") {
			const spaces = Math.max(0, contentWidth - textLength - safePadding);
			alignedText = " ".repeat(spaces) + safeText + " ".repeat(safePadding);
		} else {
			alignedText =
				" ".repeat(safePadding) +
				safeText +
				" ".repeat(Math.max(0, contentWidth - textLength - safePadding));
		}

		// Use default color if not provided
		const colorFn = colors.primary;

		// Render banner
		if (style !== "simple") {
			yield* writeLine(colorFn(topBorder));
			yield* writeLine(colorFn(`${sideBorder}${alignedText}${sideBorder}`));
			yield* writeLine(colorFn(bottomBorder));
		} else {
			yield* writeLine(colorFn(topBorder));
			yield* writeLine(colorFn(alignedText));
			yield* writeLine(colorFn(bottomBorder));
		}

		yield* writeLine(""); // Empty line after banner
	});
}
export async function showBannerExamples(): Promise<void> {
	await showComponentExample(
		"banner",
		async () => {
			// Example 1: Basic banner styles
			await banner({
				text: "Welcome to TUI Components",
				style: "simple",
				align: "center",
			})
				.pipe(Effect.provide(BannerContextLive))
				.pipe(Effect.runPromise);
			await banner({
				text: "Bordered Banner",
				style: "bordered",
				align: "center",
			})
				.pipe(Effect.provide(BannerContextLive))
				.pipe(Effect.runPromise);
			await banner({
				text: "Double Border Style",
				style: "double",
				align: "center",
			})
				.pipe(Effect.provide(BannerContextLive))
				.pipe(Effect.runPromise);
			await banner({
				text: "Rounded Corners",
				style: "rounded",
				align: "center",
			})
				.pipe(Effect.provide(BannerContextLive))
				.pipe(Effect.runPromise);

			// Example 2: Text alignment
			await banner({
				text: "Left Aligned Text",
				align: "left",
				style: "bordered",
				padding: 2,
			})
				.pipe(Effect.provide(BannerContextLive))
				.pipe(Effect.runPromise);

			await banner({
				text: "Centered Text",
				align: "center",
				style: "double",
				padding: 1,
			})
				.pipe(Effect.provide(BannerContextLive))
				.pipe(Effect.runPromise);

			await banner({
				text: "Right Aligned",
				align: "right",
				style: "rounded",
				padding: 3,
			})
				.pipe(Effect.provide(BannerContextLive))
				.pipe(Effect.runPromise);

			// Example 3: Custom colors and width
			await banner({
				text: "Custom Styled Banner",
				width: 50,
				style: "double",
				padding: 1,
				align: "center",
			})
				.pipe(Effect.provide(BannerContextLive))
				.pipe(Effect.runPromise);

			// Example 4: Long text wrapping
			await banner({
				text: "This is a very long banner message that demonstrates how text wrapping works within the specified width constraints",
				width: 60,
				style: "double",
				padding: 1,
				align: "center",
			})
				.pipe(Effect.provide(BannerContextLive))
				.pipe(Effect.runPromise);
		},
		{
			title: "Decorative Banners",
			description:
				"Display decorative text banners with various styles, alignments, and customization options",
		},
	);
}

// Run examples if this file is executed directly
if (import.meta.main) {
	showBannerExamples().catch(console.error);
}
