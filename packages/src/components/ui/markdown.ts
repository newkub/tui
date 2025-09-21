import { colors } from "../core/colors";
import { writeLine } from "../core/input";

export interface MarkdownOptions {
	content: string;
}

export function markdown(options: MarkdownOptions): void {
	const { content } = options;

	// Simple markdown parser for basic formatting
	const lines = content.split("\n");
	
	for (const line of lines) {
		let formattedLine = line;
		
		// Headers
		if (line.startsWith("# ")) {
			formattedLine = colors.bold(colors.primary(line.substring(2)));
		} else if (line.startsWith("## ")) {
			formattedLine = colors.bold(line.substring(3));
		} else if (line.startsWith("### ")) {
			formattedLine = colors.dim(colors.bold(line.substring(4)));
		}
		// Bold text
		else {
			formattedLine = line.replace(/\*\*(.*?)\*\*/g, (_, match) => colors.bold(match));
			// Italic text
			formattedLine = formattedLine.replace(/\*(.*?)\*/g, (_, match) => colors.dim(match));
			// Code
			formattedLine = formattedLine.replace(/`(.*?)`/g, (_, match) => colors.inverse(match));
		}
		
		writeLine(formattedLine);
	}
	
	writeLine(); // Empty line at the end
}