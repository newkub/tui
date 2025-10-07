import { Context, Effect, Layer, Schema } from "effect";
import { colors } from "../core/colors";
import { writeLine } from "../core/input";
import { padEnd, truncate } from "../core/utils";
import { showComponentExample } from "../utils/examples";

// Table configuration schema with validation
const TableOptionsSchema = Schema.Struct({
	data: Schema.Array(Schema.Object),
	columns: Schema.optional(
		Schema.Array(
			Schema.Struct({
				key: Schema.String,
				label: Schema.String,
				width: Schema.optional(Schema.Number),
				align: Schema.optional(Schema.Literal("left", "center", "right")),
			}),
		),
	),
});

type TableOptionsType = Schema.Schema.Type<typeof TableOptionsSchema>;

export function table(
	options: TableOptionsType,
): Effect.Effect<void, never, TableContext> {
	return Effect.gen(function* () {
		// Parse and validate options using schema
		const parsedOptions = Schema.validateSync(TableOptionsSchema)(options);

		const { data, columns } = parsedOptions;

		if (data.length === 0) {
			const { writeLine, colors } = yield* TableContext;
			yield* writeLine(colors.dim("No data to display"));
			return;
		}

		// Auto-generate columns if not provided
		const tableColumns =
			columns ||
			Object.keys(data[0] || {}).map((key) => ({
				key,
				label: key.charAt(0).toUpperCase() + key.slice(1),
				width: undefined,
				align: "left" as const,
			}));

		// Calculate column widths
		const columnWidths: number[] = tableColumns.map((col) => {
			const maxDataLength = Math.max(
				col.label.length,
				...data.map((row) => String((row as any)[col.key] || "").length),
			);
			const width =
				col.width !== undefined ? col.width : Math.min(maxDataLength, 30);
			return width; // Max width 30 chars
		});

		const { writeLine, colors, utils } = yield* TableContext;

		// Render header
		const headerRow = tableColumns
			.map((col, i) => {
				const label = utils.truncate(col.label, columnWidths[i] as number);
				return utils.padEnd(label, columnWidths[i] as number);
			})
			.join(" │ ");

		// Render data rows
		const dataRows = data.map((row) => {
			return tableColumns
				.map((col, i) => {
					const value = String((row as any)[col.key] || "");
					const truncated = utils.truncate(value, columnWidths[i] as number);
					const padded = utils.padEnd(truncated, columnWidths[i] as number);
					return padded;
				})
				.join(" │ ");
		});

		// Output all rows
		yield* writeLine(colors.primary(headerRow));
		yield* writeLine(colors.primary("─".repeat(headerRow.length)));
		for (const row of dataRows) {
			yield* writeLine(row);
		}
	});
}

// Context for Table dependencies
interface TableContext {
	readonly writeLine: (text: string) => Effect.Effect<void>;
	readonly colors: {
		readonly primary: (text: string) => string;
		readonly dim: (text: string) => string;
	};
	readonly utils: {
		readonly padEnd: (str: string, length: number) => string;
		readonly truncate: (str: string, length: number) => string;
	};
}

const TableContext = Context.GenericTag<TableContext>(
	"@tui/components/TableContext",
);

const TableContextLive = Layer.succeed(TableContext, {
	writeLine: (text: string) => Effect.sync(() => writeLine(text)),
	colors: {
		primary: colors.primary,
		dim: colors.dim,
	},
	utils: {
		padEnd,
		truncate,
	},
});

// Terminal service implementation (for backward compatibility)
const TerminalServiceLive = {
	writeLine: (text: string) => Effect.sync(() => writeLine(text)),
};

// Effect layer for terminal service (for backward compatibility)
export const TerminalServiceLayer = Effect.succeed(TerminalServiceLive);

/**
 * Show table component examples
 */
export async function showTableExamples(): Promise<void> {
	await showComponentExample(
		"table",
		async () => {
			// Example 1: Simple data table
			await table({
				data: [
					{ name: "John", age: 30, city: "New York" },
					{ name: "Jane", age: 25, city: "Los Angeles" },
					{ name: "Bob", age: 35, city: "Chicago" },
				],
				columns: [
					{ key: "name", label: "Name" },
					{ key: "age", label: "Age" },
					{ key: "city", label: "City" },
				],
			})
				.pipe(Effect.provide(TableContextLive))
				.pipe(Effect.runPromise);

			// Example 2: Auto-generated columns
			await table({
				data: [
					{ product: "Laptop", price: 999, stock: 5 },
					{ product: "Mouse", price: 25, stock: 20 },
					{ product: "Keyboard", price: 75, stock: 10 },
				],
			})
				.pipe(Effect.provide(TableContextLive))
				.pipe(Effect.runPromise);

			// Example 3: Large dataset (truncated)
			await table({
				data: [
					{
						id: 1,
						description:
							"This is a very long description that should be truncated",
						status: "active",
					},
					{
						id: 2,
						description: "Another long description here",
						status: "inactive",
					},
					{ id: 3, description: "Short", status: "pending" },
				],
				columns: [
					{ key: "id", label: "ID", width: 5 },
					{ key: "description", label: "Description", width: 30 },
					{ key: "status", label: "Status" },
				],
			})
				.pipe(Effect.provide(TableContextLive))
				.pipe(Effect.runPromise);
		},
		{
			title: "Data Tables",
			description:
				"Display tabular data with custom columns, auto-generated columns, and text truncation",
		},
	);
}

// Run examples if this file is executed directly
if (import.meta.main) {
	showTableExamples().catch(console.error);
}
