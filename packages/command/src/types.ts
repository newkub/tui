/**
 * Type definitions for TUI Command CLI framework using Effect Schema
 */

import { Effect, Schema } from "effect";

/**
 * Command configuration schema
 */
export const CommandConfigSchema = Schema.Struct({
  name: Schema.String,
  description: Schema.String,
  version: Schema.optional(Schema.String),
  usage: Schema.optional(Schema.String)
});

export type CommandConfig = Schema.Schema.Type<typeof CommandConfigSchema>;

/**
 * Option configuration schema
 */
export const OptionConfigSchema = Schema.Struct({
  flags: Schema.String,
  description: Schema.String,
  defaultValue: Schema.optional(Schema.Any),
  required: Schema.Boolean,
  choices: Schema.optional(Schema.Array(Schema.String))
});

export type OptionConfig = Schema.Schema.Type<typeof OptionConfigSchema>;

/**
 * Argument configuration schema
 */
export const ArgumentConfigSchema = Schema.Struct({
  name: Schema.String,
  description: Schema.String,
  required: Schema.Boolean,
  variadic: Schema.Boolean,
  choices: Schema.optional(Schema.Array(Schema.String)),
  defaultValue: Schema.optional(Schema.Any)
});

export type ArgumentConfig = Schema.Schema.Type<typeof ArgumentConfigSchema>;

/**
 * Parse result schema
 */
export const ParseResultSchema = Schema.Struct({
  command: Schema.String,
  args: Schema.Record({ key: Schema.String, value: Schema.Any }),
  options: Schema.Record({ key: Schema.String, value: Schema.Any }),
  unknown: Schema.Array(Schema.String)
});

export type ParseResult = Schema.Schema.Type<typeof ParseResultSchema>;

/**
 * Plugin context schema
 */
export const PluginContextSchema = Schema.Struct({
    name: Schema.String,
    version: Schema.optional(Schema.String),
    description: Schema.optional(Schema.String),
    hooks: Schema.optional(Schema.Record({
        key: Schema.String,
        value: Schema.Array(Schema.Any)
    })),
    options: Schema.optional(Schema.Record({
        key: Schema.String,
        value: Schema.suspend((): any => OptionContextSchema)
    }))
});

export type PluginContext = Schema.Schema.Type<typeof PluginContextSchema>;

export type CommandAction = (options: Record<string, any>, ...args: any[]) => Effect.Effect<any, Error, never> | Promise<any> | any;

/**
 * Command context type
 */
export interface CommandContext {
  name: string;
  description: string;
  version?: string;
  usage?: string;
  commands: Map<string, CommandContext>;
  options: Map<string, OptionContext>;
  arguments: ArgumentContext[];
  action?: CommandAction;
  parent?: CommandContext;
}

/**
 * Option context type
 */
export interface OptionContext {
  flags: string;
  description: string;
  defaultValue?: any;
  required: boolean;
  choices?: string[];
}

/**
 * Argument context type
 */
export interface ArgumentContext {
  name: string;
  description: string;
  required: boolean;
  variadic: boolean;
  choices?: string[];
  defaultValue?: any;
}

/**
 * Command context schema
 */
export const CommandContextSchema = Schema.Struct({
  name: Schema.String,
  description: Schema.String,
  version: Schema.optional(Schema.String),
  usage: Schema.optional(Schema.String),
  commands: Schema.Map({ key: Schema.String, value: Schema.suspend((): any => CommandContextSchema) }),
  options: Schema.Map({ key: Schema.String, value: Schema.suspend((): any => OptionContextSchema) }),
  arguments: Schema.Array(Schema.suspend((): any => ArgumentContextSchema)),
  action: Schema.optional(Schema.Any),
  parent: Schema.optional(Schema.suspend((): any => CommandContextSchema))
});

/**
 * Option context schema
 */
export const OptionContextSchema = Schema.Struct({
  flags: Schema.String,
  description: Schema.String,
  defaultValue: Schema.optional(Schema.Any),
  required: Schema.Boolean,
  choices: Schema.optional(Schema.Array(Schema.String))
});

/**
 * Argument context schema
 */
export const ArgumentContextSchema = Schema.Struct({
  name: Schema.String,
  description: Schema.String,
  required: Schema.Boolean,
  variadic: Schema.Boolean,
  choices: Schema.optional(Schema.Array(Schema.String)),
  defaultValue: Schema.optional(Schema.Any)
});

/**
 * Hook context schema
 */
export const HookContextSchema = Schema.Struct({
    command: Schema.optional(Schema.suspend((): any => CommandContextSchema)),
    options: Schema.Record({ key: Schema.String, value: Schema.Any }),
    args: Schema.Array(Schema.Any),
    result: Schema.optional(Schema.Any)
});

export type HookContext = Schema.Schema.Type<typeof HookContextSchema>;

/**
 * Hook handler type
 */
export type HookHandler = (context: HookContext) => Effect.Effect<any, Error, never> | Promise<any> | any;

/**
 * Hook types
 */
export const HookTypeSchema = Schema.Literal(
    'preInit',
    'postInit',
    'preParse',
    'postParse',
    'preAction',
    'postAction',
    'preHelp',
    'postHelp',
    'error'
);

export type HookType = Schema.Schema.Type<typeof HookTypeSchema>;

/**
 * Plugin manager context schema
 */
export const PluginManagerContextSchema = Schema.Struct({
    plugins: Schema.Map({ key: Schema.String, value: Schema.suspend((): any => PluginSchema) }),
    hooks: Schema.Map({ key: HookTypeSchema, value: Schema.Array(Schema.Any) })
});

export type PluginManagerContext = Schema.Schema.Type<typeof PluginManagerContextSchema>;

/**
 * Plugin schema
 */
export const PluginSchema = Schema.Struct({
    name: Schema.String,
    version: Schema.optional(Schema.String),
    description: Schema.optional(Schema.String),
    install: Schema.optional(Schema.Any),
    uninstall: Schema.optional(Schema.Any)
});

export type Plugin = Schema.Schema.Type<typeof PluginSchema>;

/**
 * Help section type
 */
export interface HelpSection {
  title: string;
  content: string;
}

/**
 * Command builder interface
 */
export interface CommandBuilder {
    name: (name: string) => CommandBuilder;
    description: (description: string) => CommandBuilder;
    version: (version: string) => CommandBuilder;
    usage: (usage: string) => CommandBuilder;
    command: (name: string) => CommandBuilder;
    option: (config: OptionConfig | string, description?: string, defaultValue?: any) => CommandBuilder;
    argument: (config: ArgumentConfig | string, description?: string, required?: boolean) => CommandBuilder;
    action: (fn: CommandAction) => CommandBuilder;
    parse: (argv?: string[]) => Effect.Effect<void, Error, never>;
    help: () => Effect.Effect<string, never, never>;
    getContext: () => CommandContext;
    plugin: (plugin: Plugin) => CommandBuilder;
    hook: (type: HookType, handler: HookHandler) => CommandBuilder;
}

/**
 * Main command factory type
 */
export type Command = (config?: Partial<CommandConfig>) => CommandBuilder;
