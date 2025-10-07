

export { createCommand } from "./command";
// Specific exports to avoid naming conflicts
export { createOption, getOptionName, getOptionFlags, optionMatches, getOptionDescription, getOptionDefaultValue, isOptionRequired, getOptionChoices, validateOptionValue, optionToString as optionToStringUtil, optionNeedsValue } from "./Option";
export { createArgument, getArgumentName, getArgumentDescription, isArgumentRequired, isArgumentVariadic, getArgumentChoices, validateArgumentValue, argumentToString, argumentToUsageString as argumentToUsageStringUtil } from "./Argument";
// Help system functions
export {
  generateHelp,
  generateUsageSection,
  generateDescriptionSection,
  generateOptionsSection,
  generateCommandsSection,
  generateExamplesSection,
  formatSection,
  getFullName,
  argumentToUsageString,
  optionToString
} from "./Help";

// Plugin system functions
export {
  createPluginManager,
  registerPlugin,
  unregisterPlugin,
  registerHook,
  executeHooks,
  getPlugins,
  getPlugin,
  mergePluginCommands,
  mergePluginOptions,
  createPlugin,
  createHelpPlugin,
  createVersionPlugin
} from "./plugin";

// Hook system functions
export {
  createHookContext,
  executeHook,
  createPreInitHook,
  createPostInitHook,
  createPreParseHook,
  createPostParseHook,
  createPreActionHook,
  createPostActionHook,
  createPreHelpHook,
  createPostHelpHook,
  createErrorHook,
  createHookPipeline,
  createConditionalHook,
  composeHooks,
  withTimeout,
  withRetry
} from "./hook";

// Re-export commonly used types and utilities
export type * from "./types";
