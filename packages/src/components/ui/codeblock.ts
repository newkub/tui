import { Context, Effect, Layer, Schema } from "effect";
import { colors } from "../core/colors";
import { writeLine } from "../core/input";
import { showComponentExample } from "../utils/examples";

// Code block configuration schema with validation
const CodeBlockOptionsSchema = Schema.Struct({
	content: Schema.String,
	language: Schema.optional(Schema.String),
	filename: Schema.optional(Schema.String),
	showLineNumbers: Schema.optional(Schema.Boolean),
	theme: Schema.optional(Schema.String),
});

type CodeBlockOptionsType = Schema.Schema.Type<typeof CodeBlockOptionsSchema>;

export interface CodeBlockOptions {
	content: string;
	language?: string;
	filename?: string;
	showLineNumbers?: boolean;
	theme?: string;
}

// Context for CodeBlock dependencies
interface CodeBlockContext {
	readonly writeLine: (text: string) => Effect.Effect<void>;
	readonly colors: {
		readonly dim: (text: string) => string;
		readonly primary: (text: string) => string;
		readonly success: (text: string) => string;
	};
}

const CodeBlockContext = Context.GenericTag<CodeBlockContext>(
	"@tui/components/CodeBlockContext",
);

export const CodeBlockContextLive = Layer.succeed(CodeBlockContext, {
	writeLine: (text: string) => Effect.sync(() => writeLine(text)),
	colors: {
		dim: colors.dim,
		primary: colors.primary,
		success: colors.success,
	},
});

/**
 * Display a code block with syntax highlighting
 */
export function codeblock(
	options: CodeBlockOptionsType,
): Effect.Effect<void, never, CodeBlockContext> {
	return Effect.gen(function* () {
		// Parse and validate options using schema
		const parsedOptions = Schema.validateSync(CodeBlockOptionsSchema)(options);

		const {
			content,
			language: lang,
			filename,
			showLineNumbers = true,
			theme = "dark",
		} = parsedOptions;

		const language: string = lang ?? "";

		const { writeLine, colors } = yield* CodeBlockContext;

		// Display filename if provided
		if (filename) {
			yield* writeLine(colors.primary(`📄 ${filename}`));
		}

		// Display language indicator if provided
		if (language) {
			yield* writeLine(colors.dim(`Language: ${language}`));
		}

		// Split content into lines for line numbers
		const lines = content.split("\n");

		// Display each line with optional line numbers
		for (let i = 0; i < lines.length; i++) {
			const lineNumber = showLineNumbers
				? `${(i + 1).toString().padStart(3, " ")}│ `
				: "";
			const lineContent = lines[i] || "";

			// Apply basic syntax highlighting (simple implementation)
			const highlightedLine = highlightSyntax(lineContent, language);
			yield* writeLine(`${colors.dim(lineNumber)}${highlightedLine}`);
		}

		// Add separator line
		yield* writeLine("");
	});
}

/**
 * Simple syntax highlighting function
 */
function highlightSyntax(line: string, language: string): string {
	// Basic syntax highlighting for common patterns
	if (
		language === "javascript" ||
		language === "typescript" ||
		language === "js" ||
		language === "ts"
	) {
		// Highlight keywords
		const keywords =
			/\b(const|let|var|function|class|if|else|for|while|return|import|export|from|async|await|try|catch|finally|throw|new|this|super|extends|implements|interface|type|enum|public|private|protected|static|readonly|abstract|as|any|boolean|number|string|object|undefined|null|never|unknown|void)\b/g;
		line = line.replace(keywords, (match) => colors.success(match));

		// Highlight strings
		line = line.replace(
			/(["'])(.*?)\1/g,
			(match, quote, content) =>
				`${colors.primary(quote)}${content}${colors.primary(quote)}`,
		);

		// Highlight comments
		line = line.replace(/\/\/(.*)$/gm, (match, comment) =>
			colors.dim(`//${comment}`),
		);
		line = line.replace(/\/\*[\s\S]*?\*\//g, (match) => colors.dim(match));
	}

	if (language === "json") {
		// Highlight JSON keys
		line = line.replace(
			/"([^"]+)":/g,
			(match, key) => `"${colors.primary(key)}":`,
		);

		// Highlight JSON strings
		line = line.replace(
			/:\s*"([^"]+)"/g,
			(match, value) => `: "${colors.success(value)}"`,
		);
	}

	if (language === "sql") {
		// Highlight SQL keywords
		const sqlKeywords =
			/\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|ON|GROUP|BY|ORDER|HAVING|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|DATABASE|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|NOT|NULL|DEFAULT|AUTO_INCREMENT|DISTINCT|AS|COUNT|SUM|AVG|MIN|MAX|LIMIT|OFFSET)\b/gi;
		line = line.replace(sqlKeywords, (match) => colors.success(match));
	}

	return line;
}

/**
 * Show code block component examples
 */
export async function showCodeBlockExamples(): Promise<void> {
	await showComponentExample(
		"codeblock",
		async () => {
			// Example 1: JavaScript code
			await Effect.succeed(
				codeblock({
					content: `function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome, \${name}\`;
}

greet("World");`,
					language: "javascript",
					filename: "example.js",
				}),
			).pipe(Effect.provide(CodeBlockContextLive), Effect.runPromise);

			// Example 2: JSON configuration
			await Effect.succeed(
				codeblock({
					content: `{
  "name": "my-package",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "typescript": "^4.9.0"
  }
}`,
					language: "json",
					filename: "package.json",
				}),
			).pipe(Effect.provide(CodeBlockContextLive), Effect.runPromise);

			// Example 3: TypeScript with line numbers disabled
			await Effect.succeed(
				codeblock({
					content: `interface User {
  readonly id: number;
  readonly name: string;
  readonly email?: string;
}

class UserService {
  private users: Map<number, User> = new Map();

  findById(id: number): User | undefined {
    return this.users.get(id);
  }

  create(user: Omit<User, 'id'>): User {
    const id = Date.now();
    const newUser: User = { id, ...user };
    this.users.set(id, newUser);
    return newUser;
  }
}`,
					language: "typescript",
					showLineNumbers: false,
				}),
			).pipe(Effect.provide(CodeBlockContextLive), Effect.runPromise);

			// Example 4: SQL query
			await Effect.succeed(
				codeblock({
					content: `SELECT
  u.id,
  u.name,
  u.email,
  COUNT(o.id) as order_count,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
  AND u.status = 'active'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 10;`,
					language: "sql",
					filename: "user-analytics.sql",
				}),
			).pipe(Effect.provide(CodeBlockContextLive), Effect.runPromise);
		},
		{
			title: "Code Blocks",
			description:
				"Display code with syntax highlighting, line numbers, and optional filenames",
		},
	);
}

// Run examples if this file is executed directly
if (import.meta.main) {
	showCodeBlockExamples().catch((error) => console.error(error));
}
