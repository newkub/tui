import { colors } from "../core/colors";
import { writeLine } from "../core/input";

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

/**
 * Display content in a bordered panel/box
 */
export function panel(options: PanelOptions): void {
	const {
		title,
		content,
		border = "single",
		width,
		titleColor = colors.primary,
		contentColor = (text: string) => text,
		borderColor = colors.dim,
	} = options;

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

	// Top border
	if (title) {
		const titlePadding = Math.max(0, contentWidth - titleLength - 2);
		const leftPadding = Math.floor(titlePadding / 2);
		const rightPadding = titlePadding - leftPadding;

		writeLine(
			borderColor(
				`${chars.tl}${chars.h.repeat(leftPadding)} ${titleColor(title)} ${chars.h.repeat(rightPadding)}${chars.tr}`,
			),
		);
	} else {
		writeLine(
			borderColor(`${chars.tl}${chars.h.repeat(contentWidth)}${chars.tr}`),
		);
	}

	// Content lines
	for (const line of lines) {
		const paddedLine =
			line + " ".repeat(Math.max(0, contentWidth - line.length));
		writeLine(
			borderColor(chars.v) + contentColor(paddedLine) + borderColor(chars.v),
		);
	}

	// Bottom border
	writeLine(
		borderColor(`${chars.bl}${chars.h.repeat(contentWidth)}${chars.br}`),
	);
	writeLine(); // Empty line after panel
}
