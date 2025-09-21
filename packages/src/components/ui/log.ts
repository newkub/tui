import { colors } from "../core/colors.js";

export type LogType = "info" | "warn" | "error" | "success";

export interface LogOptions {
	message: string;
	symbol?: string;
}

const logTypes = {
	info: {
		color: colors.info,
		defaultSymbol: "ℹ",
	},
	warn: {
		color: colors.warning,
		defaultSymbol: "⚠",
	},
	error: {
		color: colors.error,
		defaultSymbol: "✖",
	},
	success: {
		color: colors.success,
		defaultSymbol: "✓",
	},
} as const;

export function log(type: LogType, options: LogOptions): void;
export function log(type: LogType, message: string): void;
export function log(
	type: LogType,
	messageOrOptions: string | LogOptions,
): void {
	const config = logTypes[type];
	const symbol =
		typeof messageOrOptions === "string"
			? config.defaultSymbol
			: messageOrOptions.symbol || config.defaultSymbol;
	const message =
		typeof messageOrOptions === "string"
			? messageOrOptions
			: messageOrOptions.message;

	console.log(`${config.color(symbol)} ${config.color(message)}`);
}

export function info(message: string): void {
	log("info", message);
}

export function warn(message: string): void {
	log("warn", message);
}

export function error(message: string): void {
	log("error", message);
}

export function success(message: string): void {
	log("success", message);
}
