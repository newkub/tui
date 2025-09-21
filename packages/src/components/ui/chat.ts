import type { PromptResult } from "../../types";
import { CANCEL_SYMBOL, isCancel } from "../../types";
import { colors } from "../core/colors";
import { KEYS } from "../core/constants";
import {
	clearLine,
	hideCursor,
	InputHandler,
	showCursor,
	writeLine,
} from "../core/input";
import { markdown } from "./markdown";

export interface ChatUser {
	id: string;
	name: string;
	avatar?: string;
	role?: string;
}

export interface ChatMessage {
	id: string;
	user: ChatUser;
	content: string;
	timestamp: Date;
	mentions?: string[];
}

export interface ChatOptions {
	/** Chat title */
	title?: string;
	/** Current user */
	currentUser: ChatUser;
	/** Available users for @ mentions */
	users: ChatUser[];
	/** Initial messages */
	messages?: ChatMessage[];
	/** Maximum messages to display */
	maxMessages?: number;
	/** Enable markdown rendering in messages */
	enableMarkdown?: boolean;
}

/**
 * Interactive chat interface with @ mentions and markdown support
 */
export class Chat {
	private options: ChatOptions;
	private messages: ChatMessage[] = [];
	private isActive = false;

	constructor(options: ChatOptions) {
		this.options = options;
		this.messages = options.messages || [];
	}

	/**
	 * Start the chat interface
	 */
	async start(): Promise<void> {
		this.isActive = true;
		this.render();

		while (this.isActive) {
			const input = await this.getInput();
			if (isCancel(input) || !input) {
				this.isActive = false;
				break;
			}

			if (input.trim()) {
				await this.addMessage(input);
			}
		}
	}

	/**
	 * Stop the chat interface
	 */
	stop(): void {
		this.isActive = false;
	}

	/**
	 * Add a new message to the chat
	 */
	async addMessage(content: string, user?: ChatUser): Promise<void> {
		const sender = user || this.options.currentUser;
		const mentions = this.extractMentions(content);

		const message: ChatMessage = {
			id: Date.now().toString(),
			user: sender,
			content,
			timestamp: new Date(),
			mentions,
		};

		this.messages.push(message);

		// Keep only the last N messages
		const maxMessages = this.options.maxMessages || 10;
		if (this.messages.length > maxMessages) {
			this.messages = this.messages.slice(-maxMessages);
		}

		this.render();
	}

	/**
	 * Render the chat interface
	 */
	private render(): void {
		console.clear();

		// Chat header
		if (this.options.title) {
			writeLine(colors.primary(`📱 ${this.options.title}`));
			writeLine(colors.dim("─".repeat(60)));
			writeLine();
		}

		// Messages
		if (this.messages.length === 0) {
			writeLine(
				colors.dim("No messages yet. Start typing to begin the conversation!"),
			);
		} else {
			for (const message of this.messages) {
				this.renderMessage(message);
			}
		}

		writeLine();
		writeLine(colors.dim("─".repeat(60)));
		writeLine(
			colors.dim(
				"Type your message (use @ to mention users). Press Ctrl+C to exit.",
			),
		);
		writeLine();
	}

	/**
	 * Render a single message
	 */
	private renderMessage(message: ChatMessage): void {
		const timeStr = message.timestamp.toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
		});

		const avatar = message.user.avatar || "👤";
		const userColor =
			message.user.id === this.options.currentUser.id
				? colors.success
				: colors.info;
		const userName = userColor(`${avatar} ${message.user.name}`);
		const time = colors.dim(`[${timeStr}]`);

		writeLine(`${time} ${userName}`);

		// Process message content
		let content = message.content;

		// Highlight mentions
		if (message.mentions && message.mentions.length > 0) {
			for (const mention of message.mentions) {
				const user = this.options.users.find(
					(u) => u.id === mention || u.name === mention,
				);
				if (user) {
					content = content.replace(
						new RegExp(`@${mention}`, "g"),
						colors.primary(`@${user.name}`),
					);
				}
			}
		}

		// Render content with markdown if enabled
		if (
			this.options.enableMarkdown &&
			(content.includes("**") || content.includes("*") || content.includes("`"))
		) {
			markdown({ content });
		} else {
			writeLine(`  ${content}`);
		}

		writeLine();
	}

	/**
	 * Get user input with @ mention support
	 */
	private async getInput(): Promise<PromptResult<string>> {
		return new Promise((resolve) => {
			let currentValue = "";
			let cursorPosition = 0;
			let isInMentionMode = false;
			let mentionQuery = "";
			const input = new InputHandler();

			const renderInput = () => {
				// Clear input line
				process.stdout.write("\r\u001b[2K");

				const prompt = colors.primary(`${this.options.currentUser.name}: `);
				let displayValue = currentValue;

				// Highlight partial mentions
				if (isInMentionMode && mentionQuery) {
					const mentionStart = currentValue.lastIndexOf("@");
					if (mentionStart !== -1) {
						const before = currentValue.substring(0, mentionStart);
						const mention = currentValue.substring(mentionStart);
						displayValue = before + colors.warning(mention);
					}
				}

				process.stdout.write(`${prompt}${displayValue}`);
			};

			const cleanup = () => {
				showCursor();
				input.cleanup();
			};

			const cancel = () => {
				cleanup();
				resolve(CANCEL_SYMBOL);
			};

			const submit = () => {
				cleanup();
				resolve(currentValue);
			};

			const showMentionSuggestions = async (query: string) => {
				const filtered = this.options.users.filter(
					(user) =>
						user.name.toLowerCase().includes(query.toLowerCase()) ||
						user.role?.toLowerCase().includes(query.toLowerCase()),
				);

				if (filtered.length === 0) return;

				writeLine();
				writeLine(colors.dim("Available users:"));

				for (let i = 0; i < Math.min(filtered.length, 5); i++) {
					const user = filtered[i];
					const avatar = user.avatar || "👤";
					const role = user.role ? colors.dim(` (${user.role})`) : "";
					writeLine(
						`  ${colors.info(`${i + 1}.`)} ${avatar} ${colors.primary(user.name)}${role}`,
					);
				}

				const selection = await this.selectUser(filtered);
				if (selection && !isCancel(selection)) {
					// Replace the partial mention with the selected user
					const mentionStart = currentValue.lastIndexOf("@");
					if (mentionStart !== -1) {
						currentValue =
							currentValue.substring(0, mentionStart) +
							`@${(selection as ChatUser).name} `;
						cursorPosition = currentValue.length;
					}
					isInMentionMode = false;
					mentionQuery = "";

					// Clear suggestions and re-render
					console.clear();
					this.render();
					renderInput();
				}
			};

			hideCursor();
			renderInput();

			const removeKeyListener = input.onKey(async (key: string) => {
				if (key === "ctrl+c" || key === "escape") {
					cancel();
					return;
				}

				if (key === "enter") {
					submit();
					return;
				}

				if (key === "backspace") {
					if (cursorPosition > 0) {
						currentValue =
							currentValue.substring(0, cursorPosition - 1) +
							currentValue.substring(cursorPosition);
						cursorPosition--;

						// Check if we're still in mention mode
						const lastAtSymbol = currentValue.lastIndexOf("@");
						if (lastAtSymbol === -1 || cursorPosition <= lastAtSymbol) {
							isInMentionMode = false;
							mentionQuery = "";
						} else {
							mentionQuery = currentValue.substring(lastAtSymbol + 1);
						}
					}
				} else if (key.length === 1 && key >= " " && key <= "~") {
					const char = key;
					currentValue =
						currentValue.substring(0, cursorPosition) +
						char +
						currentValue.substring(cursorPosition);
					cursorPosition++;

					// Check for @ symbol
					if (char === "@") {
						isInMentionMode = true;
						mentionQuery = "";
					} else if (isInMentionMode) {
						const lastAtSymbol = currentValue.lastIndexOf("@");
						if (lastAtSymbol !== -1 && cursorPosition > lastAtSymbol) {
							mentionQuery = currentValue.substring(lastAtSymbol + 1);

							// Trigger mention suggestions after typing
							if (mentionQuery.length >= 1) {
								setTimeout(() => showMentionSuggestions(mentionQuery), 100);
							}
						} else {
							isInMentionMode = false;
							mentionQuery = "";
						}
					}
				}

				renderInput();
			});

			// Cleanup on process exit
			process.on("SIGINT", () => {
				removeKeyListener();
				cancel();
			});
		});
	}

	/**
	 * User selection for mentions
	 */
	private async selectUser(users: ChatUser[]): Promise<PromptResult<ChatUser>> {
		return new Promise((resolve) => {
			let selectedIndex = 0;
			const input = new InputHandler();

			const renderSelection = () => {
				writeLine();
				writeLine(
					colors.dim(
						"Select user (↑↓ to navigate, Enter to select, Esc to cancel):",
					),
				);

				for (let i = 0; i < users.length; i++) {
					const user = users[i];
					const isSelected = i === selectedIndex;
					const prefix = isSelected ? colors.primary("❯ ") : "  ";
					const avatar = user.avatar || "👤";
					const role = user.role ? colors.dim(` (${user.role})`) : "";
					const name = isSelected ? colors.primary(user.name) : user.name;

					writeLine(`${prefix}${avatar} ${name}${role}`);
				}
			};

			const cleanup = () => {
				showCursor();
				input.cleanup();
			};

			const cancel = () => {
				cleanup();
				resolve(CANCEL_SYMBOL);
			};

			const submit = () => {
				cleanup();
				resolve(users[selectedIndex]);
			};

			hideCursor();
			renderSelection();

			const removeKeyListener = input.onKey((key: string) => {
				if (key === "ctrl+c" || key === "escape") {
					cancel();
					return;
				}

				if (key === "enter") {
					submit();
					return;
				}

				if (key === "up") {
					selectedIndex =
						selectedIndex > 0 ? selectedIndex - 1 : users.length - 1;
					renderSelection();
				} else if (key === "down") {
					selectedIndex =
						selectedIndex < users.length - 1 ? selectedIndex + 1 : 0;
					renderSelection();
				}
			});

			// Cleanup on process exit
			process.on("SIGINT", () => {
				removeKeyListener();
				cancel();
			});
		});
	}

	/**
	 * Extract @ mentions from message content
	 */
	private extractMentions(content: string): string[] {
		const mentionRegex = /@(\w+)/g;
		const mentions: string[] = [];
		let match;

		while ((match = mentionRegex.exec(content)) !== null) {
			const mention = match[1];
			if (
				this.options.users.some(
					(user) => user.name === mention || user.id === mention,
				)
			) {
				mentions.push(mention);
			}
		}

		return mentions;
	}
}

/**
 * Create and start a chat interface
 */
export async function chat(options: ChatOptions): Promise<void> {
	const chatInstance = new Chat(options);
	await chatInstance.start();
}

/**
 * Demo chat function for showcase
 */
export function chatDemo(): void {
	const users: ChatUser[] = [
		{ id: "alice", name: "Alice", avatar: "👩‍💻", role: "Developer" },
		{ id: "bob", name: "Bob", avatar: "👨‍🎨", role: "Designer" },
		{ id: "charlie", name: "Charlie", avatar: "👨‍💼", role: "Manager" },
		{ id: "diana", name: "Diana", avatar: "👩‍🔬", role: "QA Engineer" },
	];

	const messages: ChatMessage[] = [
		{
			id: "1",
			user: users[0],
			content: "Hey team! 👋 How's the new **TUI library** coming along?",
			timestamp: new Date(Date.now() - 300000),
			mentions: [],
		},
		{
			id: "2",
			user: users[1],
			content:
				"@Alice Looking great! The `banner` and `panel` components are really nice.",
			timestamp: new Date(Date.now() - 240000),
			mentions: ["Alice"],
		},
		{
			id: "3",
			user: users[2],
			content: "@Alice @Bob Excellent work! When can we ship this? 🚀",
			timestamp: new Date(Date.now() - 180000),
			mentions: ["Alice", "Bob"],
		},
		{
			id: "4",
			user: users[3],
			content:
				"I'll run some tests on the new components. The `tree` display looks *amazing*!",
			timestamp: new Date(Date.now() - 120000),
			mentions: [],
		},
	];

	// Display demo chat
	writeLine(colors.primary("📱 Team Chat Demo"));
	writeLine(colors.dim("─".repeat(60)));
	writeLine();

	for (const message of messages) {
		const timeStr = message.timestamp.toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
		});

		const avatar = message.user.avatar || "👤";
		const userName = colors.info(`${avatar} ${message.user.name}`);
		const time = colors.dim(`[${timeStr}]`);

		writeLine(`${time} ${userName}`);

		// Process mentions
		let content = message.content;
		if (message.mentions && message.mentions.length > 0) {
			for (const mention of message.mentions) {
				content = content.replace(
					new RegExp(`@${mention}`, "g"),
					colors.primary(`@${mention}`),
				);
			}
		}

		// Simple markdown processing for demo
		content = content.replace(/\*\*(.*?)\*\*/g, (_, match) =>
			colors.bold(match),
		);
		content = content.replace(/\*(.*?)\*/g, (_, match) => colors.dim(match));
		content = content.replace(/`(.*?)`/g, (_, match) => colors.inverse(match));

		writeLine(`  ${content}`);
		writeLine();
	}

	writeLine(colors.dim("─".repeat(60)));
	writeLine(
		colors.dim(
			"💡 In real usage: Type @ to mention users, supports markdown formatting",
		),
	);
	writeLine();
}
