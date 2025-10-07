import { Context, Effect, Layer, Schema } from "effect";
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
import { showComponentExample } from "../utils/examples";
import { markdown } from "./markdown";

// Chat configuration schema with validation
const ChatOptionsSchema = Schema.Struct({
	title: Schema.optional(Schema.String),
	currentUser: Schema.Struct({
		id: Schema.String,
		name: Schema.String,
		avatar: Schema.String,
		role: Schema.String,
	}),
	users: Schema.Array(
		Schema.Struct({
			id: Schema.String,
			name: Schema.String,
			avatar: Schema.String,
			role: Schema.String,
		}),
	),
	messages: Schema.optional(
		Schema.Array(
			Schema.Struct({
				id: Schema.String,
				user: Schema.Struct({
					id: Schema.String,
					name: Schema.String,
					avatar: Schema.String,
					role: Schema.String,
				}),
				content: Schema.String,
				timestamp: Schema.Date,
				mentions: Schema.Array(Schema.String),
			}),
		),
	),
	maxMessages: Schema.optional(Schema.Number),
	enableMarkdown: Schema.optional(Schema.Boolean),
});

type ChatOptionsType = Schema.Schema.Type<typeof ChatOptionsSchema>;

export interface ChatUser {
	readonly id: string;
	readonly name: string;
	readonly avatar: string;
	readonly role: string;
}

export interface ChatMessage {
	readonly id: string;
	readonly user: ChatUser;
	readonly content: string;
	readonly timestamp: Date;
	readonly mentions: readonly string[];
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

// Context for Chat dependencies
interface ChatContext {
	readonly writeLine: (text: string) => Effect.Effect<void>;
	readonly clearScreen: () => Effect.Effect<void>;
	readonly hideCursor: () => Effect.Effect<void>;
	readonly showCursor: () => Effect.Effect<void>;
	readonly colors: {
		readonly primary: (text: string) => string;
		readonly success: (text: string) => string;
		readonly warning: (text: string) => string;
		readonly error: (text: string) => string;
		readonly info: (text: string) => string;
		readonly dim: (text: string) => string;
	};
}

const ChatContext = Context.GenericTag<ChatContext>(
	"@tui/components/ChatContext",
);

const ChatContextLive = Layer.succeed(ChatContext, {
	writeLine: (text: string) => Effect.sync(() => writeLine(text)),
	clearScreen: () =>
		Effect.sync(() => {
			console.clear();
		}),
	hideCursor: () => Effect.sync(() => hideCursor()),
	showCursor: () => Effect.sync(() => showCursor()),
	colors: {
		primary: colors.primary,
		success: colors.success,
		warning: colors.warning,
		error: colors.error,
		info: colors.info,
		dim: colors.dim,
	},
});

// Pure functions for chat logic
const extractMentions = (
	content: string,
	users: readonly ChatUser[],
): string[] => {
	const mentionRegex = /@(\w+)/g;
	const mentions: string[] = [];
	let match;

	while ((match = mentionRegex.exec(content)) !== null) {
		const mention = match[1]!;
		if (users.some((user) => user.name === mention || user.id === mention)) {
			mentions.push(mention);
		}
	}

	return mentions;
};

const createMessage = (
	content: string,
	user: ChatUser,
	users: ChatUser[],
): ChatMessage => ({
	id: Date.now().toString(),
	user,
	content,
	timestamp: new Date(),
	mentions: extractMentions(content, users),
});

const limitMessages = (
	messages: ChatMessage[],
	maxMessages: number,
): ChatMessage[] => {
	if (messages.length <= maxMessages) return messages;
	return messages.slice(-maxMessages);
};

const formatTime = (timestamp: Date): string => {
	return timestamp.toLocaleTimeString("en-US", {
		hour12: false,
		hour: "2-digit",
		minute: "2-digit",
	});
};

const formatUser = (
	user: ChatUser,
	isCurrentUser: boolean,
	colors: ChatContext["colors"],
): string => {
	const avatar = user.avatar || "👤";
	const userColor = isCurrentUser ? colors.success : colors.info;
	return userColor(`${avatar} ${user.name}`);
};

const processMessageContent = (
	content: string,
	mentions: readonly string[],
	users: readonly ChatUser[],
	colors: ChatContext["colors"],
	enableMarkdown: boolean,
): Effect.Effect<void> => {
	return Effect.gen(function* () {
		let processedContent = content;

		// Highlight mentions
		if (mentions && mentions.length > 0) {
			for (const mention of mentions) {
				const user = users.find((u) => u.id === mention || u.name === mention);
				if (user) {
					processedContent = processedContent.replace(
						new RegExp(`@${mention}`, "g"),
						colors.primary(`@${user.name}`),
					);
				}
			}
		}

		// Render content with markdown if enabled
		if (
			enableMarkdown &&
			(processedContent.includes("**") ||
				processedContent.includes("*") ||
				processedContent.includes("`"))
		) {
			// For markdown, we need to handle it differently since it requires context
			// Let's just render plain text for now to avoid context issues
			writeLine(`  ${processedContent}`);
		} else {
			writeLine(`  ${processedContent}`);
		}
	});
};

const renderMessage = (
	message: ChatMessage,
	options: ChatOptionsType,
	colors: ChatContext["colors"],
): Effect.Effect<void> => {
	return Effect.gen(function* () {
		const timeStr = formatTime(message.timestamp);
		const time = colors.dim(`[${timeStr}]`);
		const userName = formatUser(
			message.user,
			message.user.id === options.currentUser.id,
			colors,
		);

		writeLine(`${time} ${userName}`);

		yield* processMessageContent(
			message.content,
			message.mentions || [],
			options.users,
			colors,
			options.enableMarkdown || false,
		);

		writeLine("");
	});
};

const renderChat = (
	options: ChatOptionsType,
	messages: ChatMessage[],
): Effect.Effect<void> => {
	return Effect.gen(function* () {
		console.clear();

		// Chat header
		if (options.title) {
			writeLine(colors.primary(`📱 ${options.title}`));
			writeLine(colors.dim("─".repeat(60)));
			writeLine("");
		}

		// Messages
		if (messages.length === 0) {
			writeLine(
				colors.dim("No messages yet. Start typing to begin the conversation!"),
			);
		} else {
			for (const message of messages) {
				yield* renderMessage(message, options, colors);
			}
		}

		writeLine("");
		writeLine(colors.dim("─".repeat(60)));
		writeLine(
			colors.dim(
				"Type your message (use @ to mention users). Press Ctrl+C to exit.",
			),
		);
		writeLine("");
	});
};

export function createChat(options: ChatOptionsType) {
	return Effect.gen(function* () {
		// Parse and validate options using schema
		const parsedOptions = Schema.validateSync(ChatOptionsSchema)(
			options as any,
		);

		// State management with Ref - simplified without acquireRelease
		const messagesRef = yield* Effect.sync(() => new Map<string, ChatMessage>());

		// Add initial messages
		if (parsedOptions.messages) {
			for (const message of parsedOptions.messages) {
				messagesRef.set(message.id, message);
			}
		}

		const isActiveRef = yield* Effect.sync(() => ({ value: false }));

		const getMessages = (): ChatMessage[] => {
			const maxMessages = parsedOptions.maxMessages || 10;
			const messages = Array.from(messagesRef.values());
			return messages.length <= maxMessages
				? messages
				: messages.slice(-maxMessages);
		};

		const renderCurrentChat = (): Effect.Effect<void> => {
			return Effect.gen(function* () {
				console.clear();

				// Chat header
				if (parsedOptions.title) {
					writeLine(colors.primary(`📱 ${parsedOptions.title}`));
					writeLine(colors.dim("─".repeat(60)));
					writeLine("");
				}

				const messages = getMessages();

				// Messages
				if (messages.length === 0) {
					writeLine(
						colors.dim(
							"No messages yet. Start typing to begin the conversation!",
						),
					);
				} else {
					for (const message of messages) {
						yield* renderMessage(message, parsedOptions, colors);
					}
				}

				writeLine("");
				writeLine(colors.dim("─".repeat(60)));
				writeLine(
					colors.dim(
						"Type your message (use @ to mention users). Press Ctrl+C to exit.",
					),
				);
				writeLine("");
			});
		};

		const getInput = (
			options: ChatOptionsType,
		): Effect.Effect<string | symbol> => {
			return Effect.async<string | symbol>((resume) => {
				let currentValue = "";
				let cursorPosition = 0;
				let isInMentionMode = false;
				let mentionQuery = "";
				const input = new InputHandler();

				const renderInput = () => {
					// Clear input line
					process.stdout.write("\r\u001b[2K");

					const prompt = colors.primary(`${options.currentUser.name}: `);
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
					resume(Effect.succeed(CANCEL_SYMBOL));
				};

				const submit = () => {
					cleanup();
					resume(Effect.succeed(currentValue));
				};

				const showMentionSuggestions = (query: string): Effect.Effect<void> => {
					return Effect.gen(function* () {
						const filtered = options.users.filter(
							(user) =>
								user.name.toLowerCase().includes(query.toLowerCase()) ||
								(user.role &&
									user.role.toLowerCase().includes(query.toLowerCase())),
						);

						if (filtered.length === 0) return;

						writeLine("");
						writeLine(colors.dim("Available users:"));

						for (let i = 0; i < Math.min(filtered.length, 5); i++) {
							const user = filtered[i]!;
							const avatar = user.avatar || "👤";
							const role = user.role ? colors.dim(` (${user.role})`) : "";
							writeLine(
								`  ${colors.info(`${i + 1}.`)} ${avatar} ${colors.primary(user.name)}${role}`,
							);
						}

						const selection = yield* selectUser(filtered);
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
							yield* renderCurrentChat();
							renderInput();
						}
					});
				};

				const selectUser = (
					users: readonly ChatUser[],
				): Effect.Effect<ChatUser | symbol> => {
					return Effect.async<ChatUser | symbol>((resume) => {
						let selectedIndex = 0;

						const renderSelection = (): Effect.Effect<void> => {
							return Effect.gen(function* () {
								writeLine("");
								writeLine(
									colors.dim(
										"Select user (↑↓ to navigate, Enter to select, Esc to cancel):",
									),
								);

								for (let i = 0; i < users.length; i++) {
									const user = users[i]!;
									const isSelected = i === selectedIndex;
									const prefix = isSelected ? colors.primary("❯ ") : "  ";
									const avatar = user.avatar || "👤";
									const role = user.role ? colors.dim(` (${user.role})`) : "";
									const name = isSelected
										? colors.primary(user.name)
										: user.name;

									writeLine(`${prefix}${avatar} ${name}${role}`);
								}
							});
						};

						const cleanup = () => {
							showCursor();
							input.cleanup();
						};

						const cancel = () => {
							cleanup();
							resume(Effect.succeed(CANCEL_SYMBOL));
						};

						const submit = () => {
							cleanup();
							resume(Effect.succeed(users[selectedIndex]!));
						};

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
								Effect.runPromise(renderSelection()).catch(() => {});
							} else if (key === "down") {
								selectedIndex =
									selectedIndex < users.length - 1 ? selectedIndex + 1 : 0;
								Effect.runPromise(renderSelection()).catch(() => {});
							}
						});

						// Cleanup on process exit
						process.on("SIGINT", () => {
							removeKeyListener();
							cancel();
						});
					});
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
									Effect.runPromise(showMentionSuggestions(mentionQuery)).catch(
										() => {},
									);
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
		};

		const start = (): Effect.Effect<void> => {
			return Effect.gen(function* () {
				isActiveRef.value = true;
				yield* renderCurrentChat();

				while (isActiveRef.value) {
					const inputResult = yield* getInput(parsedOptions);
					if (isCancel(inputResult) || !inputResult) {
						isActiveRef.value = false;
						break;
					}

					if (inputResult.trim()) {
						yield* addMessage(inputResult);
					}
				}
			});
		};

		const stop = (): Effect.Effect<void> => {
			return Effect.sync(() => {
				isActiveRef.value = false;
			});
		};

		const addMessage = (
			content: string,
			user?: ChatUser,
		): Effect.Effect<void> => {
			return Effect.gen(function* () {
				const sender = user || parsedOptions.currentUser;
				const mentions = extractMentions(content, parsedOptions.users);

				const message: ChatMessage = {
					id: Date.now().toString(),
					user: sender,
					content,
					timestamp: new Date(),
					mentions,
				};

				messagesRef.set(message.id, message);
				yield* renderCurrentChat();
			});
		};

		return { start, stop, addMessage };
	});
}

/**
 * Create and start a chat interface
 */
export async function chat(options: ChatOptions): Promise<void> {
	const chatInstance = await Effect.runPromise(createChat(options));
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
			user: users[0]!,
			content: "Hey team! 👋 How's the new **TUI library** coming along?",
			timestamp: new Date(Date.now() - 300000),
			mentions: [],
		},
		{
			id: "2",
			user: users[1]!,
			content:
				"@Alice Looking great! The `banner` and `panel` components are really nice.",
			timestamp: new Date(Date.now() - 240000),
			mentions: ["Alice"],
		},
		{
			id: "3",
			user: users[2]!,
			content: "@Alice @Bob Excellent work! When can we ship this? 🚀",
			timestamp: new Date(Date.now() - 180000),
			mentions: ["Alice", "Bob"],
		},
		{
			id: "4",
			user: users[3]!,
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

/**
 * Show chat component examples
 */
export async function showChatExamples(): Promise<void> {
	await showComponentExample(
		"chat",
		async () => {
			// Show the demo chat interface
			chatDemo();
		},
		{
			title: "Interactive Chat Interface",
			description:
				"Real-time chat interface with @ mentions, markdown support, and user management",
		},
	);
}

// Run examples if this file is executed directly
if (import.meta.main) {
	showChatExamples().catch(console.error);
}
