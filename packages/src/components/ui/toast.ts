import { colors } from "../core/colors";
import { SYMBOLS } from "../core/constants";
import { writeLine } from "../core/input";

export interface ToastOptions {
	/** Toast message */
	message: string;
	/** Toast type */
	type?: "info" | "success" | "warning" | "error";
	/** Duration in milliseconds (default: 3000) */
	duration?: number;
	/** Auto dismiss toast */
	autoDismiss?: boolean;
}

/**
 * Display a toast notification message
 */
export function toast(options: ToastOptions): void {
	const {
		message,
		type = "info",
		duration = 3000,
		autoDismiss = true,
	} = options;

	const typeConfig = {
		info: { color: colors.info, symbol: SYMBOLS.INFO },
		success: { color: colors.success, symbol: SYMBOLS.CHECKMARK },
		warning: { color: colors.warning, symbol: SYMBOLS.WARNING },
		error: { color: colors.error, symbol: SYMBOLS.CROSS },
	};

	const config = typeConfig[type];
	const toastLine = `${config.color(config.symbol)} ${config.color(message)}`;

	// Show toast
	writeLine(`┌${"─".repeat(message.length + 4)}┐`);
	writeLine(`│ ${toastLine} │`);
	writeLine(`└${"─".repeat(message.length + 4)}┘`);

	// Auto dismiss
	if (autoDismiss) {
		setTimeout(() => {
			// Clear toast lines (3 lines)
			for (let i = 0; i < 3; i++) {
				writeLine("\u001b[2K\u001b[1A\u001b[2K");
			}
		}, duration);
	}
}
