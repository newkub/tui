import { colors } from "../core/colors";
import { writeLine } from "../core/input";
import type { TableOptions } from "../core/types";
import { padEnd, truncate } from "../core/utils";

export function table(options: TableOptions): void {
	const { data, columns } = options;

	if (data.length === 0) {
		writeLine(colors.dim("No data to display"));
		return;
	}

	// Auto-generate columns if not provided
	const tableColumns =
		columns ||
		Object.keys(data[0]).map((key) => ({
			key,
			label: key.charAt(0).toUpperCase() + key.slice(1),
			width: undefined,
			align: "left" as const,
		}));

	// Calculate column widths
	const columnWidths = tableColumns.map((col) => {
		const maxDataLength = Math.max(
			col.label.length,
			...data.map((row) => String(row[col.key] || "").length),
		);
		return col.width || Math.min(maxDataLength, 30); // Max width 30 chars
	});

	// Render header
	const headerRow = tableColumns
		.map((col, i) => {
			const label = truncate(col.label, columnWidths[i]);
			return padEnd(label, columnWidths[i]);
		})
		.join(" │ ");

	writeLine(colors.primary(headerRow));
	writeLine(colors.primary("─".repeat(headerRow.length)));

	// Render data rows
	data.forEach((row) => {
		const dataRow = tableColumns
			.map((col, i) => {
				const value = String(row[col.key] || "");
				const truncated = truncate(value, columnWidths[i]);
				const padded = padEnd(truncated, columnWidths[i]);
				return padded;
			})
			.join(" │ ");

		writeLine(dataRow);
	});

	writeLine(); // Empty line after table
}
