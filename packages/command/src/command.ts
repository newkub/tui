/**
 * Command functions for TUI Command CLI framework (Functional Programming style)
 */

import { Effect } from "effect";
import type {
  CommandConfig,
  CommandAction,
  CommandContext,
  OptionConfig,
  ArgumentConfig,
  CommandBuilder,
  OptionContext,
  ArgumentContext,
  Plugin,
  HookType,
  HookHandler,
  PluginManagerContext
} from "./types";

/**
 * Create a new command context
 */
export const createCommandContext = (
  config: { name?: string | undefined; description?: string | undefined; version?: string | undefined; usage?: string | undefined } = {}
): CommandContext => ({
  name: config.name || "",
  description: config.description || "",
  ...(config.version !== undefined && { version: config.version }),
  ...(config.usage !== undefined && { usage: config.usage }),
  commands: new Map(),
  options: new Map(),
  arguments: []
});

/**
 * Set command name
 */
export const setName = (name: string) => (context: CommandContext): CommandContext => ({
  ...context,
  name
});

/**
 * Set command description
 */
export const setDescription = (description: string) => (context: CommandContext): CommandContext => ({
  ...context,
  description
});

/**
 * Set command version
 */
export const setVersion = (version: string) => (context: CommandContext): CommandContext => ({
  ...context,
  version
});

/**
 * Set command usage
 */
export const setUsage = (usage: string) => (context: CommandContext): CommandContext => ({
  ...context,
  usage
});

/**
 * Add a subcommand
 */
export const addSubcommand = (name: string, subcommandContext: CommandContext) =>
  (context: CommandContext): CommandContext => {
    const newCommands = new Map(context.commands);
    newCommands.set(name, { ...subcommandContext, parent: context });
    return {
      ...context,
      commands: newCommands
    };
  };

/**
 * Create an option context from config
 */
const createOptionContext = (config: OptionConfig): OptionContext => ({
  flags: config.flags,
  description: config.description || "",
  defaultValue: config.defaultValue,
  required: config.required || false,
  ...(config.choices !== undefined && { choices: [...config.choices] })
});

/**
 * Add an option
 */
export const addOption = (config: OptionConfig) =>
  (context: CommandContext): CommandContext => {
    const optionContext = createOptionContext(config);
    const newOptions = new Map(context.options);
    const optionName = config.flags.split(/[,\s]+/)[0]?.replace(/^-+/, '') || 'option';
    newOptions.set(optionName, optionContext);
    return {
      ...context,
      options: newOptions
    };
  };
/**
 * Create an argument context from config
 */
const createArgumentContext = (config: ArgumentConfig): ArgumentContext => ({
  name: config.name,
  description: config.description,
  required: config.required,
  variadic: config.variadic,
  ...(config.choices !== undefined && { choices: [...config.choices] }),
  ...(config.defaultValue !== undefined && { defaultValue: config.defaultValue })
});

/**
 * Add an argument
 */
export const addArgument = (config: ArgumentConfig) =>
  (context: CommandContext): CommandContext => ({
    ...context,
    arguments: [...context.arguments, createArgumentContext(config)]
  });

/**
 * Set command action
 */
export const setAction = (action: CommandAction) =>
  (context: CommandContext): CommandContext => ({
    ...context,
    action
  });

/**
 * Get option name from flags
 */
const getOptionName = (flags: string): string => {
  return flags.split(/[,\s]+/)[0]?.replace(/^-+/, '') || 'option';
};

/**
 * Get full command name including parent commands
 */
export const getFullName = (context: CommandContext): string => {
  if (context.parent) {
    return `${getFullName(context.parent)} ${context.name}`.trim();
  }
  return context.name;
};

/**
 * Find a command by name (including subcommands)
 */
export const findCommand = (commandName: string) =>
  (context: CommandContext): Effect.Effect<CommandContext, Error, never> => {
    return Effect.gen(function* (_) {
      // If no command name provided, use the current command
      if (!commandName) {
        return context;
      }

      // Look for the command in subcommands
      const subCommand = context.commands.get(commandName);
      if (subCommand) {
        return subCommand;
      }

      // If not found, throw error
      return yield* _(Effect.fail(new Error(`Unknown command: ${commandName}`)));
    });
  };

/**
 * Parse positional arguments based on the argument definitions
 */
export const parseArguments = (parseResult: any) =>
  (context: CommandContext): any[] => {
    const args: any[] = [];

    for (let i = 0; i < context.arguments.length; i++) {
      const argDef = context.arguments[i];

      if (argDef) {
        // For now, we'll implement basic argument parsing
        if (argDef.required && args.length <= i) {
          throw new Error(`Missing required argument: ${argDef.name}`);
        }

        args.push(parseResult.args[argDef.name] || argDef.defaultValue);
      }
    }

    return args;
  };

/**
 * Execute the command with parsed arguments
 */
export const executeCommand = (parseResult: any) =>
  (context: CommandContext): Effect.Effect<void, Error, never> => {
    return Effect.gen(function* (_) {
      // If this command has an action, execute it
      if (context.action) {
        const args = parseArguments(parseResult)(context);
        const options = { ...parseResult.options };

        yield* _(Effect.promise(() =>
          Promise.resolve(context.action!(options, ...args))
        ));
      } else {
        // Show help if no action is defined
        const helpText = yield* _(generateHelp(context));
        console.log(helpText);
      }
    });
  };

/**
 * Parse command line arguments and execute the appropriate command
 */
export const parseAndExecute = (argv: string[] = process.argv.slice(2)) =>
  (context: CommandContext): Effect.Effect<void, Error, never> => {
    return Effect.gen(function* (_) {
      // Import parseArgs dynamically to avoid circular dependency
      const { parseArgs } = yield* _(Effect.promise(() => import("./parser")));
      const parseResult = parseArgs(argv);

      // Find the appropriate command to execute
      const commandToExecute = yield* _(findCommand(parseResult.command)(context));

      // Execute the command
      yield* _(executeCommand(parseResult)(commandToExecute));
    });
  };

/**
 * Generate help text (placeholder - will be implemented in help.ts)
 */
export const generateHelp = (context: CommandContext): Effect.Effect<string, never, never> => {
  // Use require to avoid case sensitivity issues
  const { generateHelp: helpGenerator } = require("./help");
  return Effect.succeed(helpGenerator(context));
};

/**
 * Command builder factory function
 */
export const createCommand = (
  config: Partial<CommandConfig> = {},
  pluginManager?: PluginManagerContext
): CommandBuilder => {
  let context = createCommandContext({
    name: config.name,
    description: config.description,
    version: config.version,
    usage: config.usage
  });

  return {
    name: (name: string) => {
      context = setName(name)(context);
      return createCommand(context, pluginManager);
    },

    description: (description: string) => {
      context = setDescription(description)(context);
      return createCommand(context, pluginManager);
    },

    version: (version: string) => {
      context = setVersion(version)(context);
      return createCommand(context, pluginManager);
    },

    usage: (usage: string) => {
      context = setUsage(usage)(context);
      return createCommand(context, pluginManager);
    },

    command: (name: string) => {
      const subCommand = createCommand({ name, description: "" }, pluginManager);
      context = addSubcommand(name, subCommand.getContext())(context);
      return subCommand;
    },

    option: (config: OptionConfig | string, description?: string, defaultValue?: any) => {
      const optionConfig: OptionConfig = typeof config === 'string'
        ? { flags: config, description: description || "", required: false, defaultValue }
        : config;

      context = addOption(optionConfig)(context);
      return createCommand(context, pluginManager);
    },

    argument: (config: ArgumentConfig | string, description?: string, required?: boolean) => {
      const argConfig: ArgumentConfig = typeof config === 'string'
        ? { name: config, description: description || "", required: required || false, variadic: false }
        : config;

      context = addArgument(argConfig)(context);
      return createCommand(context, pluginManager);
    },

    action: (fn: CommandAction) => {
      context = setAction(fn)(context);
      return createCommand(context, pluginManager);
    },

    plugin: (plugin: Plugin) => {
      // Plugin registration logic would go here
      // For now, just return the same builder
      return createCommand(context, pluginManager);
    },

    hook: (type: HookType, handler: HookHandler) => {
      // Hook registration logic would go here
      // For now, just return the same builder
      return createCommand(context, pluginManager);
    },

    parse: (argv?: string[]) => {
      return parseAndExecute(argv)(context);
    },

    help: () => {
      return generateHelp(context);
    },

    getContext: () => context
  };
};
