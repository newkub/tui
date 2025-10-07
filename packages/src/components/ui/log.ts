#!/usr/bin/env bun
import { Context, Effect, Layer, Ref, Schema } from "effect";
import { colors } from "../core/colors.js";
import { showComponentExample } from "../utils/examples";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export interface LogOptions {
	message?: string;
	symbol?: string;
	level?: LogLevel;
	timestamp?: boolean;
	prefix?: string;
	[key: string]: any; // สำหรับ structured logging
}

export interface Serializer {
	[key: string]: (value: any) => any;
}

export interface LogConfig {
	level?: LogLevel;
	transports?: LogTransport[];
	timestamp?: boolean;
	prefix?: string;
	colors?: boolean;
	serializers?: Serializer;
	prettyPrint?: boolean | PrettyPrintOptions;
}

export interface PrettyPrintOptions {
	translateTime?: boolean | string;
	ignore?: string[];
	colorize?: boolean;
	crlf?: boolean;
	errorLikeObjectKeys?: string[];
	errorProps?: string;
	levelFirst?: boolean;
	messageKey?: string;
	timestampKey?: string;
}

export interface LogTransport {
	log: (level: LogLevel, message: string, data?: any) => Effect.Effect<void>;
	level?: LogLevel | undefined;
}

const LOG_LEVELS = {
	trace: 10,
	debug: 20,
	info: 30,
	warn: 40,
	error: 50,
	fatal: 60,
} as const;

const LOG_LEVEL_NAMES = {
	10: "TRACE",
	20: "DEBUG",
	30: "INFO",
	40: "WARN",
	50: "ERROR",
	60: "FATAL",
} as const;

const logTypes = {
	trace: {
		color: colors.dim,
		defaultSymbol: "🔍",
		consoleMethod: "debug",
		level: LOG_LEVELS.trace,
	},
	debug: {
		color: colors.dim,
		defaultSymbol: "🐛",
		consoleMethod: "debug",
		level: LOG_LEVELS.debug,
	},
	info: {
		color: colors.info,
		defaultSymbol: "ℹ️",
		consoleMethod: "info",
		level: LOG_LEVELS.info,
	},
	warn: {
		color: colors.warning,
		defaultSymbol: "⚠️",
		consoleMethod: "warn",
		level: LOG_LEVELS.warn,
	},
	error: {
		color: colors.error,
		defaultSymbol: "❌",
		consoleMethod: "error",
		level: LOG_LEVELS.error,
	},
	fatal: {
		color: colors.error,
		defaultSymbol: "💀",
		consoleMethod: "error",
		level: LOG_LEVELS.fatal,
	},
	success: {
		color: colors.success,
		defaultSymbol: "✅",
		consoleMethod: "info",
		level: LOG_LEVELS.info,
	},
};

class Logger {
	private isBrowser: boolean;
	private config: LogConfig;
	private transports: LogTransport[] = [];
	private serializers: Serializer = {};

	constructor(config: LogConfig = {}) {
		this.config = {
			level: "info",
			transports: [],
			timestamp: true,
			prefix: "",
			colors: true,
			serializers: {},
			prettyPrint: false,
			...config,
		};
		this.transports = this.config.transports || [];
		this.serializers = this.config.serializers || {};
		this.isBrowser =
			typeof window !== "undefined" && typeof window.document !== "undefined";

		// Add default console transport
		this.addTransport({
			log: (level: LogLevel, message: string, data?: any) => {
				const output = this.formatOutput(level, message, data);
				const config = logTypes[level];

				// Use appropriate console method
				const consoleMethod =
					(console as any)[config.consoleMethod] || console.log;
				consoleMethod(output);
				return Effect.void;
			},
			level: this.config.level,
		});
	}

	private formatTimestamp(): string {
		const now = new Date();
		return this.isBrowser
			? now.toLocaleTimeString()
			: now.toISOString().slice(11, 19);
	}

	private shouldLog(level: LogLevel): boolean {
		return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level!];
	}

	private serializeObject(obj: any): any {
		if (obj === null || obj === undefined) return obj;
		if (
			typeof obj === "string" ||
			typeof obj === "number" ||
			typeof obj === "boolean"
		)
			return obj;

		// Handle circular references and complex objects
		const seen = new WeakSet();
		return this.serializeValue(obj, seen);
	}

	private serializeValue(value: any, seen: WeakSet<any>): any {
		if (value === null || value === undefined) return value;
		if (
			typeof value === "string" ||
			typeof value === "number" ||
			typeof value === "boolean"
		)
			return value;
		if (typeof value === "function") return "[Function]";
		if (typeof value === "symbol") return value.toString();

		if (seen.has(value)) return "[Circular]";
		seen.add(value);

		if (Array.isArray(value)) {
			return value.map((item) => this.serializeValue(item, seen));
		}

		if (typeof value === "object") {
			const result: any = {};
			for (const [key, val] of Object.entries(value)) {
				// Use custom serializer if available
				if (this.serializers[key]) {
					result[key] = this.serializers[key](val);
				} else {
					result[key] = this.serializeValue(val, seen);
				}
			}
			return result;
		}

		return String(value);
	}

	private formatOutput(level: LogLevel, message: string, data?: any): string {
		const config = logTypes[level];
		const levelStr =
			LOG_LEVEL_NAMES[config.level as keyof typeof LOG_LEVEL_NAMES];

		let output = "";

		// Pretty print format (แบบ Pino)
		if (this.config.prettyPrint) {
			const timestamp = this.config.timestamp ? this.formatTimestamp() : "";
			const prefix = this.config.prefix ? `[${this.config.prefix}] ` : "";

			output = `${timestamp}${prefix}${levelStr}: ${message}`;

			if (data && Object.keys(data).length > 0) {
				const serializedData = this.serializeObject(data);
				output += `\n${JSON.stringify(serializedData, null, 2)}`;
			}
		} else {
			// Standard format
			const timestamp = this.config.timestamp ? this.formatTimestamp() : "";
			const prefix = this.config.prefix ? `[${this.config.prefix}] ` : "";

			output = `${timestamp}${prefix}${levelStr}: ${message}`;

			if (data && Object.keys(data).length > 0) {
				const serializedData = this.serializeObject(data);
				output += ` ${JSON.stringify(serializedData)}`;
			}
		}

		return output;
	}

	private formatMessage(
		level: LogLevel,
		messageOrOptions: string | LogOptions,
	): { message: string; data?: any } {
		if (typeof messageOrOptions === "string") {
			return { message: messageOrOptions };
		}

		const options = messageOrOptions;
		const config = logTypes[options.level || level];
		const symbol = options.symbol || config.defaultSymbol;
		const timestamp = options.timestamp !== false ? this.formatTimestamp() : "";
		const prefix =
			options.prefix || this.config.prefix
				? `[${options.prefix || this.config.prefix}] `
				: "";

		let message = options.message || "";
		if (symbol) {
			message = `${symbol} ${message}`;
		}

		// Remove log-specific options from data
		const {
			message: _,
			symbol: __,
			level: ___,
			timestamp: ____,
			prefix: _____,
			...data
		} = options;

		return {
			message: `${timestamp}${prefix}${message}`,
			data: Object.keys(data).length > 0 ? data : undefined,
		};
	}

	addTransport(transport: LogTransport): void {
		this.transports.push(transport);
	}

	removeTransport(transport: LogTransport): void {
		const index = this.transports.indexOf(transport);
		if (index > -1) {
			this.transports.splice(index, 1);
		}
	}

	child(prefix: string): Logger {
		return new Logger({
			...this.config,
			prefix: this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix,
		});
	}

	trace(messageOrOptions: string | LogOptions): void {
		this.log("trace", messageOrOptions);
	}

	debug(messageOrOptions: string | LogOptions): void {
		this.log("debug", messageOrOptions);
	}

	info(messageOrOptions: string | LogOptions): void {
		this.log("info", messageOrOptions);
	}

	warn(messageOrOptions: string | LogOptions): void {
		this.log("warn", messageOrOptions);
	}

	error(messageOrOptions: string | LogOptions): void {
		this.log("error", messageOrOptions);
	}

	fatal(messageOrOptions: string | LogOptions): void {
		this.log("fatal", messageOrOptions);
	}

	success(messageOrOptions: string | LogOptions): void {
		this.log("info", messageOrOptions);
	}

	private log(level: LogLevel, messageOrOptions: string | LogOptions): void {
		if (!this.shouldLog(level)) return;

		const { message, data } = this.formatMessage(level, messageOrOptions);

		// Send to all transports
		for (const transport of this.transports) {
			if (
				!transport.level ||
				LOG_LEVELS[level] >= LOG_LEVELS[transport.level]
			) {
				transport.log(level, message, data);
			}
		}
	}
}

// Global logger instance
export const logger = new Logger();

// Convenience functions for backward compatibility
export function log(type: LogLevel, options: LogOptions): void;
export function log(type: LogLevel, message: string): void;
export function log(
	type: LogLevel,
	messageOrOptions: string | LogOptions,
): void {
	if (typeof messageOrOptions === "string") {
		(logger as any)[type](messageOrOptions);
	} else {
		(logger as any)[type](messageOrOptions);
	}
}

export function info(message: string): void {
	logger.info(message);
}

export function warn(message: string): void {
	logger.warn(message);
}

export function error(message: string): void {
	logger.error(message);
}

export function success(message: string): void {
	logger.success(message);
}

export function trace(message: string): void {
	logger.trace(message);
}

export function debug(message: string): void {
	logger.debug(message);
}

export function fatal(message: string): void {
	logger.fatal(message);
}

/**
 * Show log component examples
 */
export async function showLogExamples(): Promise<void> {
	await showComponentExample(
		"log",
		async () => {
			// Basic logging
			trace("This is a trace message");
			debug("This is a debug message");
			info("System initialization complete - all services are running");
			success("Database connection established successfully");
			warn("High memory usage detected - consider optimizing");
			error("Failed to connect to external API - retrying...");
			fatal("Critical system failure - shutting down");

			// Structured logging with objects containing circular references
			const user = {
				id: 1,
				name: "John Doe",
				email: "john@example.com",
				getProfile: function () {
					return this;
				}, // จะถูก serialize เป็น [Function]
			};

			logger.info({
				message: "User data",
				user: user,
				action: "login",
			});

			// Pretty print example
			const prettyLogger = new Logger({
				level: "debug",
				prettyPrint: true,
				timestamp: true,
			});

			prettyLogger.info({
				message: "Application started",
				version: "1.0.0",
				environment: "production",
				features: ["auth", "database", "api"],
			});

			// Custom serializers
			const customLogger = new Logger({
				serializers: {
					user: (user: any) => ({ id: user.id, name: user.name }), // แปลงเฉพาะ fields ที่ต้องการ
					error: (err: Error) => ({
						name: err.name,
						message: err.message,
						stack: err.stack,
					}),
				},
			});

			try {
				throw new Error("Test error");
			} catch (err) {
				customLogger.error({
					message: "Error occurred",
					error: err,
				});
			}
		},
		{
			title: "Advanced Logging System",
			description:
				"Multiple log levels, structured logging, child loggers, and custom formatting",
		},
	);
}

// Run examples if this file is executed directly
if (import.meta.main) {
	showLogExamples().catch(console.error);
}
