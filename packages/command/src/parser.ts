/**
 * Command line argument parser for TUI Command
 */

import type { ParseResult } from "./types";

/**
 * Parse command line arguments into a structured format
 */
export function parseArgs(argv: string[] = process.argv.slice(2)): ParseResult {
  const result: ParseResult = {
    command: "",
    args: {},
    options: {},
    unknown: []
  };

  let currentCommand = "";
  const args: string[] = [];
  const options: Record<string, any> = {};
  const unknown: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (!arg) continue;

    // Check if it's an option (starts with - or --)
    if (arg.startsWith('--') || arg.startsWith('-')) {
      const isLongOption = arg.startsWith('--');
      const optionName = isLongOption ? arg.slice(2) : arg.slice(1);

      // Handle --option=value format
      if (isLongOption && arg.includes('=')) {
        const [name, value] = arg.split('=', 2);
        if (name && value !== undefined) {
          options[name] = parseValue(value);
        }
      }
      // Handle -o value or --option value format
      else {
        const nextArg = argv[i + 1];
        if (nextArg && !nextArg.startsWith('-')) {
          options[optionName] = parseValue(nextArg);
          i++; // Skip next argument as it's the value
        } else {
          options[optionName] = true;
        }
      }
    }
    // Check if it's a command
    else if (!currentCommand && !arg.includes('=')) {
      currentCommand = arg;
    }
    // Otherwise it's an unknown argument
    else {
      unknown.push(arg);
    }
  }

  return {
    command: currentCommand,
    args: {},
    options,
    unknown
  };
}

/**
 * Parse a string value into appropriate type
 */
function parseValue(value: string): any {
  // Try to parse as boolean
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;

  // Try to parse as number
  const numValue = Number(value);
  if (!isNaN(numValue) && isFinite(numValue)) {
    return numValue;
  }

  // Return as string
  return value;
}

/**
 * Check if a string is a valid option flag
 */
export function isOptionFlag(arg: string): boolean {
  return arg.startsWith('-') && !arg.startsWith('---');
}

/**
 * Check if a string is a valid command name
 */
export function isCommandName(arg: string): boolean {
  return !arg.startsWith('-') && !arg.includes('=');
}
