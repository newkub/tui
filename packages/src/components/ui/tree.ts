import { colors } from "../core/colors";
import { writeLine } from "../core/input";

export interface TreeNode {
	/** Node name */
	name: string;
	/** Node type */
	type?: "file" | "folder";
	/** Child nodes */
	children?: TreeNode[];
	/** Node metadata */
	meta?: {
		size?: string;
		modified?: string;
		icon?: string;
	};
}

export interface TreeOptions {
	/** Tree data */
	data: TreeNode[];
	/** Show icons */
	showIcons?: boolean;
	/** Show metadata */
	showMeta?: boolean;
}

/**
 * Display a tree structure (files, folders, etc.)
 */
export function tree(options: TreeOptions): void {
	const { data, showIcons = true, showMeta = false } = options;

	const renderNode = (
		node: TreeNode,
		prefix: string,
		isLast: boolean,
		level: number = 0,
	): void => {
		const connector = isLast ? "└── " : "├── ";
		const icon = getNodeIcon(node, showIcons);
		const meta =
			showMeta && node.meta
				? ` ${colors.dim(`(${node.meta.size || node.meta.modified || ""})`)}`
				: "";

		const nodeColor = node.type === "folder" ? colors.primary : colors.dim;
		writeLine(
			`${colors.dim(prefix + connector)}${icon}${nodeColor(node.name)}${meta}`,
		);

		if (node.children && node.children.length > 0) {
			const childPrefix = prefix + (isLast ? "    " : "│   ");

			for (let i = 0; i < node.children.length; i++) {
				const child = node.children[i];
				const isLastChild = i === node.children.length - 1;
				renderNode(child, childPrefix, isLastChild, level + 1);
			}
		}
	};

	for (let i = 0; i < data.length; i++) {
		const node = data[i];
		const isLast = i === data.length - 1;
		renderNode(node, "", isLast);
	}

	writeLine(); // Empty line after tree
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
