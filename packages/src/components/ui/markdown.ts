import { Context, Effect, Layer, Schema } from "effect";
import { colors } from "../core/colors";
import { writeLine } from "../core/input";
import { showComponentExample } from "../utils/examples";
import { CodeBlockContextLive, codeblock } from "./codeblock";

// Markdown configuration schema with validation
const MarkdownOptionsSchema = Schema.Struct({
	content: Schema.String,
	enableSyntaxHighlighting: Schema.optional(Schema.Boolean),
	theme: Schema.optional(Schema.String),
	showLineNumbers: Schema.optional(Schema.Boolean),
});

type MarkdownOptionsType = Schema.Schema.Type<typeof MarkdownOptionsSchema>;

export interface MarkdownOptions {
	content: string;
	/** Enable syntax highlighting for code blocks */
	enableSyntaxHighlighting?: boolean;
	/** Default theme for syntax highlighting */
	theme?: string;
	/** Show line numbers in code blocks */
	showLineNumbers?: boolean;
}

// Context for Markdown dependencies
interface MarkdownContext {
	readonly writeLine: (text: string) => Effect.Effect<void>;
	readonly colors: {
		readonly bold: (text: string) => string;
		readonly primary: (text: string) => string;
		readonly dim: (text: string) => string;
		readonly info: (text: string) => string;
		readonly inverse: (text: string) => string;
	};
}

const MarkdownContext = Context.GenericTag<MarkdownContext>(
	"@tui/components/MarkdownContext",
);

const MarkdownContextLive = Layer.succeed(MarkdownContext, {
	writeLine: (text: string) => Effect.sync(() => writeLine(text)),
	colors: {
		bold: colors.bold,
		primary: colors.primary,
		dim: colors.dim,
		info: colors.info,
		inverse: colors.inverse,
	},
});

/**
 * Render markdown content with formatting and code block support
 */
export function markdown(
	options: MarkdownOptionsType,
): Effect.Effect<void, never, MarkdownContext> {
	return Effect.gen(function* () {
		// Parse and validate options using schema
		const parsedOptions = Schema.validateSync(MarkdownOptionsSchema)(options);

		const {
			content,
			enableSyntaxHighlighting = true,
			theme = "vitesse-dark",
			showLineNumbers = false,
		} = parsedOptions;

		const { writeLine, colors } = yield* MarkdownContext;

		// Parse markdown content
		yield* parseMarkdown(
			content,
			enableSyntaxHighlighting,
			theme,
			showLineNumbers,
		);

		yield* writeLine(""); // Empty line at the end
	});
}

const parseMarkdown = (
	content: string,
	enableSyntaxHighlighting: boolean,
	theme: string,
	showLineNumbers: boolean,
): Effect.Effect<void, never, MarkdownContext> => {
	return Effect.gen(function* () {
		const { writeLine, colors } = yield* MarkdownContext;

		const lines = content.split("\n");
		let inCodeBlock = false;
		let codeBlockContent: string[] = [];
		let codeBlockLanguage = "";

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			// Handle code blocks
			if (line?.startsWith("```")) {
				if (inCodeBlock) {
					// End of code block - render using codeblock component
					if (codeBlockContent.length > 0) {
						yield* codeblock({
							content: codeBlockContent.join("\n"),
							language: codeBlockLanguage || "text",
							theme,
							showLineNumbers,
						}).pipe(Effect.provide(CodeBlockContextLive));
					}
					inCodeBlock = false;
					codeBlockContent = [];
					codeBlockLanguage = "";
				} else {
					// Start of code block
					inCodeBlock = true;
					codeBlockLanguage = line?.substring(3).trim();
				}
				continue;
			}

			if (inCodeBlock) {
				codeBlockContent.push(line || "");
				continue;
			}

			// Process regular markdown
			let formattedLine = line;

			// Headers
			if (line?.startsWith("# ")) {
				formattedLine = colors.bold(colors.primary(line.substring(2)));
			} else if (line?.startsWith("## ")) {
				formattedLine = colors.bold(line.substring(3));
			} else if (line?.startsWith("### ")) {
				formattedLine = colors.dim(colors.bold(line.substring(4)));
			}
			// Bold text
			else {
				formattedLine =
					line?.replace(/\*\*(.*?)\*\*/g, (_, match) => colors.bold(match)) ||
					"";
				// Italic text
				formattedLine = formattedLine.replace(/\*(.*?)\*/g, (_, match) =>
					colors.dim(match),
				);
				// Inline code
				formattedLine = formattedLine.replace(/`(.*?)`/g, (_, match) =>
					colors.inverse(match),
				);
			}

			yield* writeLine(formattedLine);
		}
	});
};

/**
 * Show markdown component examples
 */
export async function showMarkdownExamples(): Promise<void> {
	await showComponentExample(
		"markdown",
		async () => {
			// Example 1: Basic markdown rendering
			await markdown({
				content: `# Hello World

This is **bold text** and this is *italic text*.

- List item 1
- List item 2
- List item 3

[Link to example](https://example.com)

---

Regular paragraph after horizontal rule.`,
			})
				.pipe(Effect.provide(MarkdownContextLive))
				.pipe(Effect.runPromise);

			// Example 2: With code blocks
			await markdown({
				content: `# Code Examples

Here's a JavaScript function:

\`\`\`javascript
// Function to calculate fibonacci
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
\`\`\`

And here's some TypeScript:

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
};
\`\`\`

> Note: Code blocks will be rendered with syntax highlighting when available.`,
				enableSyntaxHighlighting: true,
				showLineNumbers: true,
			})
				.pipe(Effect.provide(MarkdownContextLive))
				.pipe(Effect.runPromise);

			// Example 3: Headers and formatting
			await markdown({
				content: `# Main Title

## Section 1

This is a paragraph with **bold** and *italic* text.

### Subsection 1.1

More content here.

## Section 2

- Bullet point 1
- Bullet point 2
  - Nested bullet
  - Another nested bullet
- Bullet point 3

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

> This is a blockquote with **bold** text inside.

Final paragraph with inline \`code\`.`,
			})
				.pipe(Effect.provide(MarkdownContextLive))
				.pipe(Effect.runPromise);
		},
		{
			title: "Markdown Rendering",
			description:
				"Render markdown content with headers, lists, code blocks, and formatting",
		},
	);
}

// Run examples if this file is executed directly
if (import.meta.main) {
	showMarkdownExamples().catch(console.error);
}
