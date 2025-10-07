/**
 * Plugin system for TUI Command CLI framework (Functional Programming style)
 */

import { Effect } from "effect";
import type {
  Plugin,
  PluginContext,
  PluginManagerContext,
  HookType,
  HookHandler,
  CommandContext,
  OptionContext
} from "./types";

/**
 * Create a plugin manager context
 */
export const createPluginManager = (): PluginManagerContext => ({
  plugins: new Map(),
  hooks: new Map()
});

/**
 * Register a plugin
 */
export const registerPlugin = (plugin: Plugin) =>
  (manager: PluginManagerContext): Effect.Effect<PluginManagerContext, Error, never> => {
    // Validate plugin
    if (!plugin.name) {
      return Effect.fail(new Error("Plugin must have a name"));
    }

    // Check if plugin already exists
    if (manager.plugins.has(plugin.name)) {
      return Effect.fail(new Error(`Plugin '${plugin.name}' is already registered`));
    }

    // Install plugin if install method exists
    if (plugin.install) {
      const updatedManager: PluginManagerContext = {
        ...manager,
        plugins: new Map(manager.plugins).set(plugin.name, plugin)
      };

      // Call install and return the updated manager
      return Effect.flatMap(
        plugin.install(updatedManager),
        (installedManager: PluginManagerContext) => Effect.succeed(installedManager)
      );
    }

    // Add plugin to manager
    const newPlugins = new Map(manager.plugins);
    newPlugins.set(plugin.name, plugin);

    return Effect.succeed({
      ...manager,
      plugins: newPlugins
    });
  };

/**
 * Unregister a plugin
 */
export const unregisterPlugin = (pluginName: string) =>
  (manager: PluginManagerContext): Effect.Effect<PluginManagerContext, Error, never> => {
    const plugin = manager.plugins.get(pluginName) as Plugin | undefined;
    if (!plugin) {
      return Effect.fail(new Error(`Plugin '${pluginName}' is not registered`));
    }

    let updatedManager = manager;

    // Uninstall plugin if uninstall method exists
    if (plugin.uninstall) {
      return Effect.flatMap(
        plugin.uninstall(updatedManager),
        (uninstalledManager: PluginManagerContext) => {
          const newPlugins = new Map(uninstalledManager.plugins);
          newPlugins.delete(pluginName);

          return Effect.succeed({
            ...uninstalledManager,
            plugins: newPlugins
          });
        }
      );
    }

    // Remove plugin from manager
    const newPlugins = new Map(updatedManager.plugins);
    newPlugins.delete(pluginName);

    return Effect.succeed({
      ...updatedManager,
      plugins: newPlugins
    });
  };

/**
 * Register a hook
 */
export const registerHook = (type: HookType, handler: HookHandler, pluginName?: string) =>
  (manager: PluginManagerContext): PluginManagerContext => {
    const currentHooks = manager.hooks.get(type) || [];
    const newHooks = new Map(manager.hooks);
    newHooks.set(type, [...currentHooks, handler]);

    return {
      ...manager,
      hooks: newHooks
    };
  };

/**
 * Execute hooks of a specific type
 */
export const executeHooks = (type: HookType, context: any) =>
  (manager: PluginManagerContext): Effect.Effect<any[], Error, never> => {
    return Effect.gen(function* (_) {
      const hooks = manager.hooks.get(type) || [];
      const results: any[] = [];

      for (const hook of hooks) {
        try {
          const result = yield* _(Effect.promise(() =>
            Promise.resolve(hook(context))
          ));
          results.push(result);
        } catch (error) {
          return yield* _(Effect.fail(new Error(`Hook '${type}' failed: ${error}`)));
        }
      }

      return results;
    });
  };

/**
 * Get all registered plugins
 */
export const getPlugins = (manager: PluginManagerContext): Map<string, Plugin> => {
  return new Map(manager.plugins) as Map<string, Plugin>;
};

/**
 * Get plugin by name
 */
export const getPlugin = (name: string) =>
  (manager: PluginManagerContext): Plugin | undefined => {
    return manager.plugins.get(name) as Plugin | undefined;
  };

/**
   * Add commands from plugins to command context
   */
export const mergePluginCommands = (pluginManager: PluginManagerContext) =>
  (commandContext: CommandContext): CommandContext => {
    // Plugins don't directly contribute commands in this design
    // This function can be extended if needed for specific plugin types
    return commandContext;
  };

/**
 * Add options from plugins to command context
 */
export const mergePluginOptions = (pluginManager: PluginManagerContext) =>
  (commandContext: CommandContext): CommandContext => {
    // Plugins in this design don't directly contribute options
    // This function can be extended if plugins need to add options
    return commandContext;
  };

/**
 * Create a plugin
 */
export const createPlugin = (config: { name: string; version?: string; description?: string; install?: (context: PluginManagerContext) => Effect.Effect<never, Error, never>; uninstall?: (context: PluginManagerContext) => Effect.Effect<never, Error, never> }): Plugin => ({
  name: config.name,
  version: config.version,
  description: config.description,
  install: config.install,
  uninstall: config.uninstall
});

/**
 * Built-in plugins
 */
export const createHelpPlugin = (): Plugin => ({
  name: 'help',
  version: '1.0.0',
  description: 'Built-in help system',
  install: (manager: PluginManagerContext) => Effect.succeed(manager)
});

export const createVersionPlugin = (): Plugin => ({
  name: 'version',
  version: '1.0.0',
  description: 'Built-in version system',
  install: (manager: PluginManagerContext) => Effect.succeed(manager)
});
