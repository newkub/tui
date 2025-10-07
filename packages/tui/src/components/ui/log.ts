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

interface LoggerState {
	config: LogConfig;
	transports: LogTransport[];
	serializers: Serializer;
	isBrowser: boolean;
}

const createLoggerState = (config: LogConfig = {}): LoggerState => {
	const loggerConfig: LogConfig = {
		level: "info" as LogLevel,
		transports: [],
		timestamp: true,
		prefix: "",
		colors: true,
		serializers: {},
		prettyPrint: false,
		...config,
	};

	return {
		config: loggerConfig,
		transports: loggerConfig.transports || [],
		serializers: loggerConfig.serializers || {},
		isBrowser: typeof window !== "undefined" && typeof window.document !== "undefined",
	};
};

const formatTimestamp = (isBrowser: boolean): string => {
	const now = new Date();
	return isBrowser ? now.toLocaleTimeString() : now.toISOString().slice(11, 19);
};

const shouldLog = (level: LogLevel, configLevel: LogLevel): boolean => {
	return LOG_LEVELS[level] >= LOG_LEVELS[configLevel];
};

const serializeObject = (obj: any, serializers: Serializer): any => {
	if (obj === null || obj === undefined) return obj;
	if (
		typeof obj === "string" ||
		typeof obj === "number" ||
		typeof obj === "boolean"
	)
		return obj;

	// Handle circular references and complex objects
	const seen = new WeakSet();
	return serializeValue(obj, seen, serializers);
};

const serializeValue = (value: any, seen: WeakSet<any>, serializers: Serializer): any => {
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
		return value.map((item) => serializeValue(item, seen, serializers));
	}

	if (typeof value === "object") {
		const result: any = {};
		for (const [key, val] of Object.entries(value)) {
			// Use custom serializer if available
			if (serializers[key]) {
				result[key] = serializers[key](val);
			} else {
				result[key] = serializeValue(val, seen, serializers);
			}
		}
		return result;
	}

	return String(value);
};

const formatOutput = (
	level: LogLevel,
	message: string,
	data: any,
	config: LogConfig,
	serializers: Serializer,
	isBrowser: boolean
): string => {
	const logType = logTypes[level];
	const levelStr = LOG_LEVEL_NAMES[logType.level as keyof typeof LOG_LEVEL_NAMES];

	let output = "";

	// Pretty print format (แบบ Pino)
	if (config.prettyPrint) {
		const timestamp = config.timestamp ? formatTimestamp(isBrowser) : "";
		const prefix = config.prefix ? `[${config.prefix}] ` : "";

		output = `${timestamp}${prefix}${levelStr}: ${message}`;

		if (data && Object.keys(data).length > 0) {
			const serializedData = serializeObject(data, serializers);
			output += `\n${JSON.stringify(serializedData, null, 2)}`;
		}
	} else {
		// Standard format
		const timestamp = config.timestamp ? formatTimestamp(isBrowser) : "";
		const prefix = config.prefix ? `[${config.prefix}] ` : "";

		output = `${timestamp}${prefix}${levelStr}: ${message}`;

		if (data && Object.keys(data).length > 0) {
			const serializedData = serializeObject(data, serializers);
			output += ` ${JSON.stringify(serializedData)}`;
		}
	}

	return output;
};

const formatMessage = (
	level: LogLevel,
	messageOrOptions: string | LogOptions,
	config: LogConfig,
	isBrowser: boolean
): { message: string; data?: any } => {
	if (typeof messageOrOptions === "string") {
		return { message: messageOrOptions };
	}

	const options = messageOrOptions;
	const logType = logTypes[options.level || level];
	const symbol = options.symbol || logType.defaultSymbol;
	const timestamp = options.timestamp !== false ? formatTimestamp(isBrowser) : "";
	const prefix = options.prefix || config.prefix ? `[${options.prefix || config.prefix}] ` : "";

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
};

const createConsoleTransport = (configLevel?: LogLevel) => ({
	log: (level: LogLevel, message: string, data?: any) => {
		const output = formatOutput(level, message, data, { level: configLevel } as LogConfig, {}, false);
		const logType = logTypes[level];

		// Use appropriate console method
		const consoleMethod = (console as any)[logType.consoleMethod] || console.log;
		consoleMethod(output);
		return Effect.void;
	},
	level: configLevel,
});

const createLogger = (config: LogConfig = {}) => {
	const state = createLoggerState(config);

	// Add default console transport
	const transports = [createConsoleTransport(state.config.level), ...state.transports];

	const logMethod = (level: LogLevel) => (messageOrOptions: string | LogOptions): void => {
		if (!shouldLog(level, state.config.level!)) return;

		const { message, data } = formatMessage(level, messageOrOptions, state.config, state.isBrowser);

		// Send to all transports
		for (const transport of transports) {
			if (
				!transport.level ||
				LOG_LEVELS[level] >= LOG_LEVELS[transport.level]
			) {
				transport.log(level, message, data);
			}
		}
	};

	return {
		addTransport: (transport: LogTransport) => {
			transports.push(transport);
		},
		removeTransport: (transport: LogTransport) => {
			const index = transports.indexOf(transport);
			if (index > -1) {
				transports.splice(index, 1);
			}
		},
		child: (prefix: string) => {
			return createLogger({
				...state.config,
				prefix: state.config.prefix ? `${state.config.prefix}:${prefix}` : prefix,
			});
		},
		trace: logMethod("trace"),
		debug: logMethod("debug"),
		info: logMethod("info"),
		warn: logMethod("warn"),
		error: logMethod("error"),
		fatal: logMethod("fatal"),
		success: logMethod("info"),
	};
};

// Global logger instance
export const logger = createLogger();

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
			const prettyLogger = createLogger({
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
			const customLogger = createLogger({
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
