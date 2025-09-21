import { colors } from "../core/colors";
import { writeLine } from "../core/input";

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

/**
 * Display a banner with decorative borders
 */
export function banner(options: BannerOptions): void {
	const {
		text,
		style = "bordered",
		align = "center",
		width,
		color = colors.primary,
		padding = 1,
	} = options;

	const textLength = text.length;
	const bannerWidth = width || textLength + padding * 2 + 2;
	const contentWidth = bannerWidth - 2;

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
	let alignedText = text;
	if (align === "center") {
		const spaces = Math.max(0, Math.floor((contentWidth - textLength) / 2));
		alignedText =
			" ".repeat(spaces) +
			text +
			" ".repeat(contentWidth - spaces - textLength);
	} else if (align === "right") {
		const spaces = Math.max(0, contentWidth - textLength - padding);
		alignedText = " ".repeat(spaces) + text + " ".repeat(padding);
	} else {
		alignedText =
			" ".repeat(padding) +
			text +
			" ".repeat(Math.max(0, contentWidth - textLength - padding));
	}

	// Render banner
	if (style !== "simple") {
		writeLine(color(topBorder));
		writeLine(color(`${sideBorder}${alignedText}${sideBorder}`));
		writeLine(color(bottomBorder));
	} else {
		writeLine(color(topBorder));
		writeLine(color(alignedText));
		writeLine(color(bottomBorder));
	}

	writeLine(); // Empty line after banner
}
