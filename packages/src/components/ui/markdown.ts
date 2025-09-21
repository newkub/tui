import { colors } from "../core/colors";
import { writeLine } from "../core/input";
import { codeblock } from "./codeblock";

export interface MarkdownOptions {
	content: string;
	/** Enable syntax highlighting for code blocks */
	enableSyntaxHighlighting?: boolean;
	/** Default theme for syntax highlighting */
	theme?: string;
	/** Show line numbers in code blocks */
	showLineNumbers?: boolean;
}

export async function markdown(options: MarkdownOptions): Promise<void> {
	const {
		content,
		enableSyntaxHighlighting = true,
		theme = "vitesse-dark",
		showLineNumbers = false,
	} = options;

	// Parse markdown content
	await parseMarkdown(
		content,
		enableSyntaxHighlighting,
		theme,
		showLineNumbers,
	);

	writeLine(); // Empty line at the end
}

async function parseMarkdown(
	content: string,
	enableSyntaxHighlighting: boolean,
	theme: string,
	showLineNumbers: boolean,
): Promise<void> {
	const lines = content.split("\n");
	let inCodeBlock = false;
	let codeBlockContent: string[] = [];
	let codeBlockLanguage = "";

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Handle code blocks
		if (line.startsWith("```")) {
			if (inCodeBlock) {
				// End of code block - render using codeblock component
				if (codeBlockContent.length > 0) {
					await codeblock({
						code: codeBlockContent.join("\n"),
						language: codeBlockLanguage || "text",
						enableSyntaxHighlighting,
						theme,
						showLineNumbers,
					});
				}
				inCodeBlock = false;
				codeBlockContent = [];
				codeBlockLanguage = "";
			} else {
				// Start of code block
				inCodeBlock = true;
				codeBlockLanguage = line.substring(3).trim();
			}
			continue;
		}

		if (inCodeBlock) {
			codeBlockContent.push(line);
			continue;
		}

		// Process regular markdown
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
			formattedLine = line.replace(/\*\*(.*?)\*\*/g, (_, match) =>
				colors.bold(match),
			);
			// Italic text
			formattedLine = formattedLine.replace(/\*(.*?)\*/g, (_, match) =>
				colors.dim(match),
			);
			// Inline code
			formattedLine = formattedLine.replace(/`(.*?)`/g, (_, match) =>
				colors.inverse(match),
			);
		}

		writeLine(formattedLine);
	}
}
