import { colors } from "../core/colors";
import { SYMBOLS } from "../core/constants";

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
	style?: "solid" | "dashed" | "dotted";
}

/**
 * Display a horizontal line separator with optional title
 */
export function line(options: LineOptions = {}): void {
	const {
		title,
		char = SYMBOLS.HORIZONTAL_LINE,
		width = 60,
		color = colors.dim,
		style = "solid",
	} = options;

	let lineChar = char;

	// Apply style variations
	if (style === "dashed") {
		lineChar = "─";
	} else if (style === "dotted") {
		lineChar = "·";
	}

	if (title) {
		const titleLength = title.length;
		const padding = Math.max(2, Math.floor((width - titleLength - 2) / 2));
		const leftLine = lineChar.repeat(padding);
		const rightLine = lineChar.repeat(width - padding - titleLength - 2);

		console.log(color(`${leftLine} ${title} ${rightLine}`));
	} else {
		console.log(color(lineChar.repeat(width)));
	}
}

/**
 * Display a section separator with title
 */
export function section(
	title: string,
	options: Omit<LineOptions, "title"> = {},
): void {
	line({ ...options, title, color: colors.primary });
}

/**
 * Display a simple divider
 */
export function divider(options: Omit<LineOptions, "title"> = {}): void {
	line({ ...options, char: "─", color: colors.dim });
}
