import * as fs from "fs";
import * as path from "path";
import type { PromptResult } from "../../types";
import { CANCEL_SYMBOL } from "../../types";
import { colors } from "../core/colors";
import {
	clearLine,
	hideCursor,
	InputHandler,
	showCursor,
	writeLine,
} from "../core/input";

export interface FileItem {
	name: string;
	path: string;
	type: "file" | "directory";
	size?: number;
	modified?: Date;
}

export interface FileOptions {
	/** Prompt message */
	message: string;
	/** Starting directory */
	startPath?: string;
	/** File filter pattern (glob-like) */
	filter?: string;
	/** Allow selecting directories */
	allowDirectories?: boolean;
	/** Allow selecting files */
	allowFiles?: boolean;
	/** Show hidden files */
	showHidden?: boolean;
}

/**
 * File/directory browser and selector
 */
export async function file(
	options: FileOptions,
): Promise<PromptResult<string>> {
	const {
		message,
		startPath = process.cwd(),
		filter,
		allowDirectories = true,
		allowFiles = true,
		showHidden = false,
	} = options;

	return new Promise((resolve) => {
		let currentPath = path.resolve(startPath);
		let selectedIndex = 0;
		let items: FileItem[] = [];

		const loadDirectory = (dirPath: string) => {
			try {
				const entries = fs.readdirSync(dirPath, { withFileTypes: true });

				items = entries
					.filter((entry) => {
						// Filter hidden files
						if (!showHidden && entry.name.startsWith(".")) return false;

						// Apply file filter
						if (filter) {
							const regex = new RegExp(filter.replace(/\*/g, ".*"));
							if (!regex.test(entry.name)) return false;
						}

						// Check if type is allowed
						if (entry.isDirectory() && !allowDirectories) return false;
						if (entry.isFile() && !allowFiles) return false;

						return true;
					})
					.map((entry) => {
						const fullPath = path.join(dirPath, entry.name);
						let size: number | undefined;
						let modified: Date | undefined;

						try {
							const stats = fs.statSync(fullPath);
							size = entry.isFile() ? stats.size : undefined;
							modified = stats.mtime;
						} catch (_e) {
							// Ignore stat errors
						}

						return {
							name: entry.name,
							path: fullPath,
							type: entry.isDirectory()
								? ("directory" as const)
								: ("file" as const),
							size,
							modified,
						};
					})
					.sort((a, b) => {
						// Directories first, then files
						if (a.type !== b.type) {
							return a.type === "directory" ? -1 : 1;
						}
						return a.name.localeCompare(b.name);
					});

				// Add parent directory option
				if (currentPath !== path.parse(currentPath).root) {
					items.unshift({
						name: "..",
						path: path.dirname(currentPath),
						type: "directory",
					});
				}

				selectedIndex = 0;
			} catch (_error) {
				items = [];
			}
		};

		const formatFileSize = (bytes: number): string => {
			const units = ["B", "KB", "MB", "GB"];
			let size = bytes;
			let unitIndex = 0;

			while (size >= 1024 && unitIndex < units.length - 1) {
				size /= 1024;
				unitIndex++;
			}

			return `${size.toFixed(unitIndex > 0 ? 1 : 0)}${units[unitIndex]}`;
		};

		const render = () => {
			clearLine();
			writeLine(colors.primary(message));
			writeLine();
			writeLine(colors.dim(`Current: ${currentPath}`));
			writeLine();

			if (items.length === 0) {
				writeLine(colors.dim("No items found or access denied"));
				writeLine();
				writeLine(colors.dim("Press Esc to cancel"));
				return;
			}

			// Display items
			const maxVisible = 10;
			const startIndex = Math.max(
				0,
				selectedIndex - Math.floor(maxVisible / 2),
			);
			const endIndex = Math.min(items.length, startIndex + maxVisible);

			for (let i = startIndex; i < endIndex; i++) {
				const item = items[i];
				const isSelected = i === selectedIndex;
				const prefix = isSelected ? colors.primary("❯ ") : "  ";

				let icon = "";
				let nameColor = colors.dim;

				if (item.type === "directory") {
					icon = item.name === ".." ? "↩️ " : "📁 ";
					nameColor = colors.primary;
				} else {
					icon = "📄 ";
					nameColor = (text: string) => text;
				}

				let sizeInfo = "";
				if (item.size !== undefined) {
					sizeInfo = ` ${colors.dim(`(${formatFileSize(item.size)})`)}`;
				}

				const displayName = isSelected
					? nameColor(item.name)
					: nameColor(item.name);
				writeLine(`${prefix}${icon}${displayName}${sizeInfo}`);
			}

			writeLine();
			writeLine(colors.dim("↑↓ Navigate, Enter to select/open, Esc to cancel"));
		};

		const input = new InputHandler();

		const cleanup = () => {
			showCursor();
			input.cleanup();
		};

		const cancel = () => {
			cleanup();
			resolve(CANCEL_SYMBOL);
		};

		hideCursor();
		loadDirectory(currentPath);
		render();

		const removeKeyListener = input.onKey((key: string) => {
			if (key === "ctrl+c" || key === "escape") {
				cancel();
				return;
			}

			if (key === "enter") {
				const selectedItem = items[selectedIndex];
				if (!selectedItem) return;

				if (selectedItem.type === "directory") {
					// Navigate to directory
					currentPath = selectedItem.path;
					loadDirectory(currentPath);
					render();
				} else {
					// Select file
					cleanup();
					resolve(selectedItem.path);
				}
				return;
			}

			if (key === "up") {
				selectedIndex =
					selectedIndex > 0 ? selectedIndex - 1 : items.length - 1;
				render();
				return;
			}

			if (key === "down") {
				selectedIndex =
					selectedIndex < items.length - 1 ? selectedIndex + 1 : 0;
				render();
				return;
			}
		});

		// Cleanup on process exit
		process.on("SIGINT", () => {
			removeKeyListener();
			cancel();
		});
	});
}
