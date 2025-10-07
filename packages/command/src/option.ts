/**
 * Option functions for TUI Command CLI framework (Functional Programming style)
 */

import type { OptionConfig } from "./types";

/**
 * Get the option name (first flag without dashes)
 */
export const getOptionName = (config: OptionConfig): string => {
  const flags = config.flags.split(/[,\s]+/);
  const firstFlag = flags[0]?.replace(/^-+/, '') || 'option';
  return firstFlag;
};

/**
 * Get all option flags
 */
export const getOptionFlags = (config: OptionConfig): string[] => {
  return config.flags.split(/[,\s]+/).map(flag => flag.trim());
};

/**
 * Check if a given argument matches this option
 */
export const optionMatches = (config: OptionConfig) =>
  (arg: string): boolean => {
    return getOptionFlags(config).some(flag => {
      if (flag.startsWith('--')) {
        return arg === flag;
      } else if (flag.startsWith('-')) {
        return arg === flag;
      }
      return false;
    });
  };

/**
 * Get the option description
 */
export const getOptionDescription = (config: OptionConfig): string => {
  return config.description || '';
};

/**
 * Get the default value
 */
export const getOptionDefaultValue = (config: OptionConfig): any => {
  return config.defaultValue;
};

/**
 * Check if the option is required
 */
export const isOptionRequired = (config: OptionConfig): boolean => {
  return config.required || false;
};

/**
 * Get the allowed choices
 */
export const getOptionChoices = (config: OptionConfig): string[] | undefined => {
  return config.choices ? [...config.choices] : undefined;
};

/**
 * Validate a value against the option's constraints
 */
export const validateOptionValue = (config: OptionConfig) =>
  (value: any): { valid: boolean; error?: string } => {
    // Check if required and no value provided
    if (isOptionRequired(config) && (value === undefined || value === null)) {
      return { valid: false, error: `Option '${getOptionName(config)}' is required` };
    }

    // Check choices if defined
    const choices = getOptionChoices(config);
    if (choices && value !== undefined && !choices.includes(value)) {
      return {
        valid: false,
        error: `Option '${getOptionName(config)}' must be one of: ${choices.join(', ')}`
      };
    }

    return { valid: true };
  };

/**
 * Get the option configuration
 */
export const getOptionConfig = (config: OptionConfig): OptionConfig => {
  return config;
};

/**
 * Create a string representation for help text
 */
export const optionToString = (config: OptionConfig): string => {
  const flags = getOptionFlags(config).join(', ');
  const description = getOptionDescription(config);

  let result = `  ${flags}`;

  // Add argument placeholder if needed
  if (optionNeedsValue(config)) {
    result += ` <value>`;
  }

  // Add description
  if (description) {
    const padding = Math.max(1, 30 - result.length);
    result += ' '.repeat(padding) + description;
  }

  return result;
};

/**
 * Check if this option requires a value
 */
export const optionNeedsValue = (config: OptionConfig): boolean => {
  // Simple heuristic: if it has choices or a default value, it likely needs a value
  return !!(config.choices || config.defaultValue !== undefined);
};

/**
 * Create an option from config
 */
export const createOption = (config: OptionConfig) => ({
  name: getOptionName(config),
  flags: getOptionFlags(config),
  description: getOptionDescription(config),
  defaultValue: getOptionDefaultValue(config),
  required: isOptionRequired(config),
  choices: getOptionChoices(config),
  matches: optionMatches(config),
  validate: validateOptionValue(config),
  toString: () => optionToString(config),
  needsValue: () => optionNeedsValue(config),
  getConfig: () => getOptionConfig(config)
});
