import { Context, Effect, Layer, Schema } from "effect";
import { colors } from "../core/colors";
import { writeLine } from "../core/input";
import { showComponentExample } from "../utils/examples";

// Tree configuration schema with validation
const TreeOptionsSchema = Schema.Struct({
	data: Schema.Array(
		Schema.Struct({
			name: Schema.String,
			type: Schema.Literal("file", "folder"),
			children: Schema.optional(Schema.Array(Schema.Unknown)),
			meta: Schema.optional(
				Schema.Struct({
					size: Schema.optional(Schema.String),
					modified: Schema.optional(Schema.String),
					icon: Schema.optional(Schema.String),
				}),
			),
		}),
	),
	showIcons: Schema.optional(Schema.Boolean),
	showMeta: Schema.optional(Schema.Boolean),
});

type TreeOptionsType = Schema.Schema.Type<typeof TreeOptionsSchema>;

export interface TreeNode {
	/** Node name */
	readonly name: string;
	/** Node type */
	readonly type?: "file" | "folder";
	/** Child nodes */
	readonly children?: readonly TreeNode[] | undefined;
	/** Node metadata */
	readonly meta?:
		| {
				readonly size?: string;
				readonly modified?: string;
				readonly icon?: string;
		  }
		| undefined;
}

export interface TreeOptions {
	/** Tree data */
	data: TreeNode[];
	/** Show icons */
	showIcons?: boolean;
	/** Show metadata */
	showMeta?: boolean;
}

// Context for Tree dependencies
interface TreeContext {
	readonly writeLine: (text: string) => Effect.Effect<void>;
	readonly colors: {
		readonly bold: (text: string) => string;
		readonly primary: (text: string) => string;
		readonly dim: (text: string) => string;
		readonly info: (text: string) => string;
	};
}

const TreeContext = Context.GenericTag<TreeContext>(
	"@tui/components/TreeContext",
);

const TreeContextLive = Layer.succeed(TreeContext, {
	writeLine: (text: string) => Effect.sync(() => writeLine(text)),
	colors: {
		bold: colors.bold,
		primary: colors.primary,
		dim: colors.dim,
		info: colors.info,
	},
});

/**
 * Display a tree structure (files, folders, etc.)
 */
export function tree(
	options: TreeOptionsType,
): Effect.Effect<void, never, TreeContext> {
	return Effect.gen(function* () {
		// Parse and validate options using schema
		const parsedOptions = Schema.validateSync(TreeOptionsSchema)(options);

		const { data, showIcons = true, showMeta = false } = parsedOptions;

		// Cast the validated data to TreeNode[] since schema ensures the structure
		const treeData = data as TreeNode[];

		if (data.length === 0) {
			const { writeLine, colors } = yield* TreeContext;
			yield* writeLine(colors.dim("No data to display"));
			return;
		}

		const { writeLine, colors } = yield* TreeContext;

		const renderNode = (
			node: TreeNode,
			prefix: string,
			isLast: boolean,
			level: number = 0,
		): Effect.Effect<void> => {
			return Effect.gen(function* () {
				const connector = isLast ? "└── " : "├── ";
				const icon = getNodeIcon(node, showIcons);
				const meta =
					showMeta && node.meta
						? ` ${colors.dim(`(${node.meta.size || node.meta.modified || ""})`)}`
						: "";

				const nodeColor = node.type === "folder" ? colors.primary : colors.dim;
				const nodeLine = `${colors.dim(prefix + connector)}${icon}${nodeColor(node.name)}${meta}`;

				yield* writeLine(nodeLine);

				if (node.children && node.children.length > 0) {
					const childPrefix = prefix + (isLast ? "    " : "│   ");

					const childrenEffects = node.children.map((child, i) => {
						const isLastChild = i === node.children!.length - 1;
						return renderNode(child, childPrefix, isLastChild, level + 1);
					});

					yield* Effect.all(childrenEffects, { concurrency: "unbounded" });
				}
			});
		};

		const rootEffects = treeData.map((node, i) => {
			const isLast = i === treeData.length - 1;
			return renderNode(node as TreeNode, "", isLast, 0);
		});

		yield* Effect.all([...rootEffects, Effect.sync(() => writeLine(""))], {
			concurrency: "unbounded",
		});
	});
}

/**
 * Show tree component examples
 */
export async function showTreeExamples(): Promise<void> {
	await showComponentExample(
		"tree",
		async () => {
			// Example 1: File system tree
			await Effect.succeed(
				tree({
					data: [
						{
							name: "src",
							type: "folder",
							children: [
								{
									name: "components",
									type: "folder",
									children: [
										{ name: "Button.tsx", type: "file" },
										{ name: "Input.tsx", type: "file" },
										{ name: "Modal.tsx", type: "file" },
									],
								},
								{ name: "utils.ts", type: "file" },
								{ name: "index.ts", type: "file" },
							],
						},
						{
							name: "package.json",
							type: "file",
							meta: { icon: "📦 " },
						},
						{ name: "README.md", type: "file", meta: { icon: "📖 " } },
					],
					showIcons: true,
					showMeta: false,
				}),
			).pipe(Effect.provide(TreeContextLive), Effect.runPromise);

			// Example 2: With metadata
			await Effect.succeed(
				tree({
					data: [
						{
							name: "Documents",
							type: "folder",
							children: [
								{
									name: "report.pdf",
									type: "file",
									meta: { size: "2.1 MB", modified: "2024-01-15" },
								},
								{
									name: "presentation.pptx",
									type: "file",
									meta: { size: "5.5 MB", modified: "2024-01-14" },
								},
							],
						},
						{ name: "Downloads", type: "folder", children: [] },
					],
					showIcons: true,
					showMeta: true,
				}),
			).pipe(Effect.provide(TreeContextLive), Effect.runPromise);

			// Example 3: Simple folder structure
			await Effect.succeed(
				tree({
					data: [
						{
							name: "home",
							type: "folder",
							children: [
								{
									name: "user",
									type: "folder",
									children: [
										{ name: ".bashrc", type: "file" },
										{ name: ".profile", type: "file" },
										{ name: "documents", type: "folder", children: [] },
									],
								},
							],
						},
					],
					showIcons: false,
				}),
			).pipe(Effect.provide(TreeContextLive), Effect.runPromise);
		},
		{
			title: "Tree Structures",
			description:
				"Display hierarchical data like file systems, folder structures, and nested information",
		},
	);
}

// Run examples if this file is executed directly
if (import.meta.main) {
	showTreeExamples();
}

function getNodeIcon(node: TreeNode, showIcons: boolean): string {
	if (!showIcons) return "";

	if (node.meta?.icon) {
		return `${node.meta.icon} `;
	}

	if (node.type === "folder") {
		return node.children && node.children.length > 0 ? "📁 " : "📂 ";
	}

	// File icons based on name/extension
	const name = node.name.toLowerCase();
	if (name.endsWith(".ts") || name.endsWith(".js")) return "📄 ";
	if (name.endsWith(".json")) return "📋 ";
	if (name.endsWith(".md")) return "📝 ";
	if (name.endsWith(".yml") || name.endsWith(".yaml")) return "⚙️ ";
	if (name.includes("package.json")) return "📦 ";
	if (name.includes("readme")) return "📖 ";

	return "📄 ";
}
