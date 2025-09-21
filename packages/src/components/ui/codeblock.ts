import { colors } from "../core/colors";
import { writeLine } from "../core/input";

export interface CodeBlockOptions {
	/** Code content */
	code: string;
	/** Programming language */
	language?: string;
	/** File name to display */
	filename?: string;
	/** Theme for syntax highlighting */
	theme?: string;
	/** Enable syntax highlighting */
	enableSyntaxHighlighting?: boolean;
	/** Show line numbers */
	showLineNumbers?: boolean;
}

/**
 * Display a code block with syntax highlighting and optional filename
 */
export async function codeblock(options: CodeBlockOptions): Promise<void> {
	const {
		code,
		language = "text",
		filename,
		theme = "vitesse-dark",
		enableSyntaxHighlighting = true,
		showLineNumbers = false
	} = options;

	await renderCodeBlock(code, language, filename, theme, enableSyntaxHighlighting, showLineNumbers);
}

async function renderCodeBlock(
	code: string, 
	language: string, 
	filename?: string, 
	theme: string = "vitesse-dark",
	enableSyntaxHighlighting: boolean = true,
	showLineNumbers: boolean = false
): Promise<void> {
	const lines = code.split('\n');
	const maxWidth = Math.max(
		...lines.map(line => line.length),
		filename ? filename.length + 4 : 0,
		20
	) + 4;

	// Top border with filename
	if (filename) {
		const padding = Math.max(0, maxWidth - filename.length - 4);
		const leftPadding = Math.floor(padding / 2);
		const rightPadding = padding - leftPadding;
		
		writeLine(colors.primary(`┌${"─".repeat(leftPadding)} 📄 ${filename} ${"─".repeat(rightPadding)}┐`));
	} else {
		writeLine(colors.primary(`┌${"─".repeat(maxWidth)}┐`));
	}

	// Language indicator (if provided)
	if (language && language !== "text") {
		const langLabel = ` ${getLanguageIcon(language)} ${language.toUpperCase()} `;
		const langPadding = Math.max(0, maxWidth - langLabel.length);
		writeLine(colors.primary("│") + colors.info(langLabel) + " ".repeat(langPadding) + colors.primary("│"));
		writeLine(colors.primary(`├${"─".repeat(maxWidth)}┤`));
	}

	// Code content with syntax highlighting
	if (enableSyntaxHighlighting && await canHighlight(language)) {
		try {
			const { codeToANSI } = await import('@shikijs/cli');
			const mappedLanguage = mapLanguage(language);
			const highlighted = await codeToANSI(code, mappedLanguage as any, theme as any);
			
			// Split highlighted code into lines and add borders
			const highlightedLines = highlighted.split('\n');
			for (let i = 0; i < highlightedLines.length; i++) {
				const line = highlightedLines[i];
				const lineNumber = showLineNumbers ? colors.dim(`${(i + 1).toString().padStart(3)} │ `) : "";
				const paddedLine = line + " ".repeat(Math.max(0, maxWidth - getVisualLength(line) - (showLineNumbers ? 6 : 0)));
				writeLine(colors.primary("│ ") + lineNumber + paddedLine + colors.primary("│"));
			}
		} catch (error) {
			// Fallback to simple code block
			renderSimpleCodeBlock(lines, maxWidth, showLineNumbers);
		}
	} else {
		// Simple code block without highlighting
		renderSimpleCodeBlock(lines, maxWidth, showLineNumbers);
	}

	// Bottom border
	writeLine(colors.primary(`└${"─".repeat(maxWidth)}┘`));
	writeLine(); // Empty line after code block
}

function renderSimpleCodeBlock(lines: string[], maxWidth: number, showLineNumbers: boolean): void {
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const lineNumber = showLineNumbers ? colors.dim(`${(i + 1).toString().padStart(3)} │ `) : "";
		const paddedLine = line + " ".repeat(Math.max(0, maxWidth - line.length - (showLineNumbers ? 6 : 0)));
		writeLine(colors.primary("│ ") + lineNumber + colors.inverse(paddedLine) + colors.primary("│"));
	}
}

function getLanguageIcon(language: string): string {
	const icons: Record<string, string> = {
		javascript: "🟨",
		typescript: "🔷", 
		python: "🐍",
		bash: "🐚",
		json: "📄",
		yaml: "⚙️",
		html: "🌐",
		css: "🎨",
		markdown: "📝",
		sql: "💾",
		docker: "🐳",
		rust: "🦀",
		go: "🐹"
	};
	return icons[language.toLowerCase()] || "📄";
}

function mapLanguage(language: string): string {
	const languageMap: Record<string, string> = {
		'js': 'javascript',
		'ts': 'typescript', 
		'py': 'python',
		'sh': 'bash',
		'yml': 'yaml',
		'md': 'markdown'
	};
	return languageMap[language.toLowerCase()] || language;
}

async function canHighlight(language: string): Promise<boolean> {
	const supportedLanguages = [
		'javascript', 'typescript', 'python', 'bash', 'yaml', 
		'json', 'html', 'css', 'markdown', 'sql', 'rust', 'go'
	];
	const mapped = mapLanguage(language);
	return supportedLanguages.includes(mapped.toLowerCase());
}

function getVisualLength(text: string): number {
	// Remove ANSI escape codes for accurate length calculation
	return text.replace(/\u001b\[[0-9;]*m/g, '').length;
}
