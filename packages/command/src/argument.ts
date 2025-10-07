/**
 * Argument functions for TUI Command CLI framework (Functional Programming style)
 */

import type { ArgumentConfig } from "./types";

/**
 * Get the argument name
 */
export const getArgumentName = (config: ArgumentConfig): string => {
  return config.name;
};

/**
 * Get the argument description
 */
export const getArgumentDescription = (config: ArgumentConfig): string => {
  return config.description || '';
};

/**
 * Check if the argument is required
 */
export const isArgumentRequired = (config: ArgumentConfig): boolean => {
  return config.required || false;
};

/**
 * Check if the argument is variadic (accepts multiple values)
 */
export const isArgumentVariadic = (config: ArgumentConfig): boolean => {
  return config.variadic || false;
};

/**
 * Get the allowed choices
 */
export const getArgumentChoices = (config: ArgumentConfig): string[] | undefined => {
  return config.choices ? [...config.choices] : undefined;
};

/**
 * Validate a value against the argument's constraints
 */
export const validateArgumentValue = (config: ArgumentConfig) =>
  (value: any): { valid: boolean; error?: string } => {
    // Check if required and no value provided
    if (isArgumentRequired(config) && (value === undefined || value === null || value === '')) {
      return { valid: false, error: `Argument '${getArgumentName(config)}' is required` };
    }

    // Check choices if defined
    const choices = getArgumentChoices(config);
    if (choices && value !== undefined && !choices.includes(value)) {
      return {
        valid: false,
        error: `Argument '${getArgumentName(config)}' must be one of: ${choices.join(', ')}`
      };
    }

    return { valid: true };
  };

/**
 * Get the argument configuration
 */
export const getArgumentConfig = (config: ArgumentConfig): ArgumentConfig => {
  return config;
};

/**
 * Create a string representation for help text
 */
export const argumentToString = (config: ArgumentConfig): string => {
  const name = getArgumentName(config);
  const description = getArgumentDescription(config);

  let result = `<${name}>`;

  // Add description
  if (description) {
    result += ` ${description}`;
  }

  return result;
};

/**
 * Create a usage string for help text
 */
export const argumentToUsageString = (config: ArgumentConfig): string => {
  const name = getArgumentName(config);
  const isOptional = !isArgumentRequired(config);

  let result = isOptional ? `[${name}]` : `<${name}>`;

  if (isArgumentVariadic(config)) {
    result = `${result}...`;
  }

  return result;
};

/**
 * Create an argument from config
 */
export const createArgument = (config: ArgumentConfig) => ({
  name: getArgumentName(config),
  description: getArgumentDescription(config),
  required: isArgumentRequired(config),
  variadic: isArgumentVariadic(config),
  choices: getArgumentChoices(config),
  validate: validateArgumentValue(config),
  toString: () => argumentToString(config),
  toUsageString: () => argumentToUsageString(config),
  getConfig: () => getArgumentConfig(config)
});
