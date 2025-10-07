import { Context, Effect, Fiber, Layer, Ref, Schema } from "effect";
import { colors } from "../core/colors";
import { writeLine } from "../core/input";
import { showComponentExample } from "../utils/examples";

// Search configuration schema with validation
const SearchOptionsSchema = Schema.Struct({
	items: Schema.Array(Schema.String),
	placeholder: Schema.optional(Schema.String),
	multiSelect: Schema.optional(Schema.Boolean),
	caseSensitive: Schema.optional(Schema.Boolean),
	maxHeight: Schema.optional(Schema.Number),
	prompt: Schema.optional(Schema.String),
});

type SearchOptionsType = Schema.Schema.Type<typeof SearchOptionsSchema>;

export interface SearchOptions {
	/** Array of items to search through */
	items: string[];
	/** Placeholder text for search input */
	placeholder?: string;
	/** Allow multiple selections */
	multiSelect?: boolean;
	/** Case sensitive search */
	caseSensitive?: boolean;
	/** Maximum height of the search results */
	maxHeight?: number;
	/** Custom prompt text */
	prompt?: string;
}

export interface SearchResult {
	/** Selected items */
	selected: string[];
	/** Search query used */
	query: string;
	/** Whether user cancelled */
	cancelled: boolean;
}

// Context for Search dependencies
interface SearchContext {
	readonly writeLine: (text: string) => Effect.Effect<void>;
	readonly colors: {
		readonly primary: (text: string) => string;
		readonly dim: (text: string) => string;
		readonly info: (text: string) => string;
		readonly success: (text: string) => string;
		readonly warning: (text: string) => string;
	};
}

const SearchContext = Context.GenericTag<SearchContext>(
	"@tui/components/SearchContext",
);

const SearchContextLive = Layer.succeed(SearchContext, {
	writeLine: (text: string) => Effect.sync(() => writeLine(text)),
	colors: {
		primary: colors.primary,
		dim: colors.dim,
		info: colors.info,
		success: colors.success,
		warning: colors.warning,
	},
});

// Fuzzy matching algorithm
const fuzzyMatch = (
	query: string,
	text: string,
	caseSensitive = false,
): number => {
	if (!query) return 0;

	const q = caseSensitive ? query : query.toLowerCase();
	const t = caseSensitive ? text : text.toLowerCase();

	let score = 0;
	let queryIndex = 0;

	for (let i = 0; i < t.length && queryIndex < q.length; i++) {
		if (t[i] === q[queryIndex]) {
			score += (queryIndex === 0 ? 2 : 1) * (q.length - queryIndex + 1);
			queryIndex++;
		}
	}

	return queryIndex === q.length ? score : 0;
};

// Render search interface
const renderSearch = (
	query: string,
	filteredItems: Array<{ item: string; score: number; match: boolean }>,
	selectedIndex: number,
	multiSelect: boolean,
	selectedItems: Set<string>,
	maxHeight: number,
	prompt: string,
	caseSensitive: boolean,
): Effect.Effect<void, never, SearchContext> => {
	return Effect.gen(function* () {
		const { writeLine, colors } = yield* SearchContext;

		// Render prompt
		const promptLine = `${colors.primary(prompt || "🔍 Search")}: ${colors.info(query || "Enter search query...")}`;
		yield* writeLine(promptLine);

		// Render separator
		yield* writeLine(colors.dim("─".repeat(Math.min(promptLine.length, 80))));

		// Render filtered results
		const visibleItems = filteredItems.slice(0, maxHeight);

		for (let i = 0; i < visibleItems.length; i++) {
			const item = visibleItems[i];
			if (!item) continue;

			const { item: itemText, score, match } = item;
			const isSelected = i === selectedIndex;
			const isItemSelected = selectedItems.has(itemText);

			let line = "";

			// Selection indicator
			if (multiSelect) {
				line += isItemSelected ? colors.success("✓ ") : "  ";
			}

			// Current selection indicator
			if (isSelected) {
				line += colors.primary("▶ ");
			} else {
				line += "  ";
			}

			// Highlight matching parts
			if (match && query) {
				const regex = new RegExp(
					`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
					caseSensitive ? "g" : "gi",
				);
				line += itemText.replace(regex, colors.warning("$1"));
			} else {
				line += itemText;
			}

			// Apply selection styling
			if (isSelected) {
				line = colors.primary(line);
			} else if (isItemSelected) {
				line = colors.success(line);
			}

			yield* writeLine(line);
		}

		// Render help text
		const totalResults = filteredItems.length;
		const selectedCount = selectedItems.size;
		const helpText = colors.dim(
			`${totalResults} results` +
				(multiSelect ? ` | ${selectedCount} selected` : "") +
				` | ↑↓ Navigate | ${multiSelect ? "Space Select | " : ""}Enter Confirm | Esc Cancel`,
		);
		yield* writeLine(helpText);
	});
};

// Main interactive search function
export function search(
	options: SearchOptionsType,
): Effect.Effect<SearchResult, never, SearchContext> {
	return Effect.gen(function* () {
		// Parse and validate options using schema
		const parsedOptions = Schema.validateSync(SearchOptionsSchema)(options);

		const {
			items,
			placeholder = "Type to search...",
			multiSelect = false,
			caseSensitive = false,
			maxHeight = 10,
			prompt = "🔍 Search",
		} = parsedOptions;

		const { writeLine, colors } = yield* SearchContext;

		// State management
		const queryRef = yield* Ref.make("");
		const selectedIndexRef = yield* Ref.make(0);
		const selectedItemsRef = yield* Ref.make(new Set<string>());
		const cancelledRef = yield* Ref.make(false);

		// Filter and score items based on query
		const filterItems = (query: string) => {
			return items
				.map((item) => ({
					item,
					score: fuzzyMatch(query, item, caseSensitive),
					match: query === "" || fuzzyMatch(query, item, caseSensitive) > 0,
				}))
				.filter((result) => result.match)
				.sort((a, b) => b.score - a.score);
		};

		// Render loop
		const renderLoop = (): Effect.Effect<void, never, SearchContext> => {
			return Effect.gen(function* () {
				const query = yield* Ref.get(queryRef);
				const selectedIndex = yield* Ref.get(selectedIndexRef);
				const selectedItems = yield* Ref.get(selectedItemsRef);

				const filteredItems = filterItems(query);
				const maxIndex = Math.max(0, filteredItems.length - 1);

				// Ensure selected index is within bounds
				yield* Ref.set(selectedIndexRef, Math.min(selectedIndex, maxIndex));

				yield* renderSearch(
					query,
					filteredItems,
					selectedIndex,
					multiSelect,
					selectedItems,
					maxHeight,
					prompt,
					caseSensitive,
				);
			});
		};

		// Keyboard input handler
		const handleKey = (key: string): Effect.Effect<boolean> => {
			return Effect.gen(function* () {
				const query = yield* Ref.get(queryRef);
				const selectedIndex = yield* Ref.get(selectedIndexRef);
				const selectedItems = yield* Ref.get(selectedItemsRef);

				let shouldContinue = true;

				switch (key) {
					case "\x1b": // ESC
						yield* Ref.set(cancelledRef, true);
						shouldContinue = false;
						break;

					case "\r": // Enter
					case "\n": // Enter
						shouldContinue = false;
						break;

					case "\x1b[A": // Up arrow
					case "k": {
						const filteredItems = filterItems(query);
						const newIndex = Math.max(0, selectedIndex - 1);
						yield* Ref.set(selectedIndexRef, newIndex);
						break;
					}

					case "\x1b[B": // Down arrow
					case "j": {
						const filteredItemsDown = filterItems(query);
						const maxIndex = Math.max(0, filteredItemsDown.length - 1);
						const newIndexDown = Math.min(maxIndex, selectedIndex + 1);
						yield* Ref.set(selectedIndexRef, newIndexDown);
						break;
					}

					case " ":
						if (multiSelect) {
							const filteredItemsSpace = filterItems(query);
							if (filteredItemsSpace[selectedIndex]) {
								const item = filteredItemsSpace[selectedIndex].item;
								const newSelectedItems = new Set(selectedItems);
								if (newSelectedItems.has(item)) {
									newSelectedItems.delete(item);
								} else {
									newSelectedItems.add(item);
								}
								yield* Ref.set(selectedItemsRef, newSelectedItems);
							}
						}
						break;

					case "\x7f": // Backspace
					case "\b": {
						const newQuery = query.slice(0, -1);
						yield* Ref.set(queryRef, newQuery);
						// Reset selection when query changes
						yield* Ref.set(selectedIndexRef, 0);
						break;
					}

					default:
						// Regular character
						if (key.length === 1 && !key.match(/[\x00-\x1f\x7f]/)) {
							const newQueryChar = query + key;
							yield* Ref.set(queryRef, newQueryChar);
							// Reset selection when query changes
							yield* Ref.set(selectedIndexRef, 0);
						}
						break;
				}

				return shouldContinue;
			});
		};

		// Main search loop
		yield* renderLoop();

		let shouldContinue = true;
		while (shouldContinue) {
			// Read keyboard input (simplified - in real implementation would use proper input handling)
			// For demo purposes, we'll simulate key presses
			const key = yield* Effect.succeed(""); // This would be replaced with actual input reading

			if (key) {
				shouldContinue = yield* handleKey(key);
				if (shouldContinue) {
					yield* renderLoop();
				}
			} else {
				// No input available, continue
				yield* Effect.sleep(100);
			}
		}

		// Get final state
		const finalQuery = yield* Ref.get(queryRef);
		const finalSelectedItems = yield* Ref.get(selectedItemsRef);
		const cancelled = yield* Ref.get(cancelledRef);

		// Get selected items based on mode
		const selected = multiSelect
			? Array.from(finalSelectedItems)
			: cancelled
				? []
				: [
						filterItems(finalQuery)[yield* Ref.get(selectedIndexRef)]?.item ||
							"",
					];

		return {
			selected: selected.filter(Boolean),
			query: finalQuery,
			cancelled,
		};
	});
}

/**
 * Show search component examples
 */
export async function showSearchExamples(): Promise<void> {
	await showComponentExample(
		"search",
		async () => {
			// Example 1: Simple single-select search
			const result1 = await search({
				items: [
					"apple",
					"banana",
					"cherry",
					"date",
					"elderberry",
					"fig",
					"grape",
					"kiwi",
					"lemon",
					"mango",
					"orange",
					"peach",
					"pear",
					"pineapple",
					"strawberry",
					"watermelon",
				],
				placeholder: "Select a fruit...",
				prompt: "🍎 Fruit Selector",
			})
				.pipe(Effect.provide(SearchContextLive))
				.pipe(Effect.runPromise);

			if (!result1.cancelled && result1.selected.length > 0) {
				console.log(`Selected: ${result1.selected[0]}`);
			}

			// Example 2: Multi-select search
			const result2 = await search({
				items: [
					"JavaScript",
					"TypeScript",
					"Python",
					"Go",
					"Rust",
					"C++",
					"Java",
					"C#",
					"PHP",
					"Ruby",
					"Swift",
					"Kotlin",
					"Scala",
					"Clojure",
					"Elixir",
				],
				placeholder: "Select programming languages...",
				multiSelect: true,
				prompt: "💻 Language Multi-Select",
			})
				.pipe(Effect.provide(SearchContextLive))
				.pipe(Effect.runPromise);

			if (!result2.cancelled && result2.selected.length > 0) {
				console.log(`Selected: ${result2.selected.join(", ")}`);
			}
		},
		{
			title: "Interactive Search",
			description:
				"Fuzzy search interface similar to fzf with real-time filtering and selection",
		},
	);
}

// Run examples if this file is executed directly
if (import.meta.main) {
	showSearchExamples().catch(console.error);
}
