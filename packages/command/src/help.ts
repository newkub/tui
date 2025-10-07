/**
 * Help system for TUI Command CLI framework (Functional Programming style)
 */

import type { CommandContext, HelpSection, ArgumentContext, OptionContext } from "./types";

// ANSI Color codes for subtle, professional terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  white: '\x1b[37m',
} as const;

// Helper to colorize text
const colorize = (text: string, color: keyof typeof colors): string => {
  return `${colors[color]}${text}${colors.reset}`;
};

// Indentation constants
const INDENT = '  ';
const OPTION_INDENT = '    ';

/**
 * Generate complete help text for a command context
 */
export const generateHelp = (context: CommandContext): string => {
  const sections: HelpSection[] = [
    generateUsageSection(context),
    generateDescriptionSection(context),
    generateCommandsSection(context),
    generateOptionsSection(context),
    generateExamplesSection(context)
  ];

  const formattedSections = sections
    .filter(section => section.content.length > 0)
    .map(formatSection)
    .join('\n\n');

  // Header with version (minimal, professional style like vercel)
  const nameDisplay = context.name.charAt(0).toUpperCase() + context.name.slice(1);
  const versionDisplay = context.version ? ` ${context.version}` : '';
  const header = `\n${colorize(nameDisplay + versionDisplay, 'bold')}\n`;
  
  return header + formattedSections + '\n';
};

/**
 * Generate usage section
 */
export const generateUsageSection = (context: CommandContext): HelpSection => {
  // Standard CLI usage format
  let usage = INDENT;
  
  if (context.parent) {
    usage += `${getFullName(context.parent)} `;
  }
  usage += colorize(context.name, 'bold');

  // Add options placeholder first (standard convention)
  if (context.options.size > 0) {
    usage += colorize(' [options]', 'dim');
  }

  // Add command placeholder
  if (context.commands.size > 0) {
    usage += colorize(' <command>', 'dim');
  }

  // Add arguments
  if (context.arguments.length > 0) {
    const argsString = context.arguments
      .map(arg => argumentToUsageString(arg))
      .join(' ');
    usage += ` ${colorize(argsString, 'dim')}`;
  }

  return {
    title: 'Usage',
    content: usage
  };
};

/**
 * Generate description section
 */
export const generateDescriptionSection = (context: CommandContext): HelpSection => {
  if (!context.description) {
    return { title: 'Description', content: '' };
  }

  return {
    title: 'Description',
    content: `${INDENT}${context.description}`
  };
};

/**
 * Generate options section
 */
export const generateOptionsSection = (context: CommandContext): HelpSection => {
  if (context.options.size === 0) {
    return { title: 'Options', content: '' };
  }

  const lines: string[] = [];
  for (const option of context.options.values()) {
    lines.push(optionToString(option));
  }

  return {
    title: 'Options',
    content: lines.join('\n')
  };
};

/**
 * Generate commands section
 */
export const generateCommandsSection = (context: CommandContext): HelpSection => {
  if (context.commands.size === 0) {
    return { title: 'Commands', content: '' };
  }

  const lines: string[] = [];
  
  // Find max command name length for alignment (like vercel style)
  const maxLength = Math.max(...Array.from(context.commands.keys()).map(k => k.length), 20);
  
  for (const [name, command] of context.commands) {
    const description = command.description || '';
    const paddedName = name.padEnd(maxLength + 4);
    lines.push(`${OPTION_INDENT}${colorize(paddedName, 'bold')}${description}`);
  }

  return {
    title: 'Commands',
    content: lines.join('\n')
  };
};

/**
 * Generate examples section
 */
export const generateExamplesSection = (context: CommandContext): HelpSection => {
  const examples: string[] = [];

  // Basic usage example
  if (context.options.size > 0 || context.arguments.length > 0 || context.commands.size > 0) {
    // Example 1: Basic usage
    const desc1 = `${INDENT}${colorize('–', 'dim')} Run ${context.name}`;
    let cmd1 = `\n${OPTION_INDENT}${colorize('$', 'dim')} ${context.name}`;
    examples.push(desc1 + cmd1);

    // Example 2: With arguments if available
    if (context.arguments.length > 0) {
      const firstArg = context.arguments[0];
      if (firstArg) {
        const exampleValue = firstArg.name === 'file' ? 'input.txt' : 'value';
        const desc2 = `\n${INDENT}${colorize('–', 'dim')} With argument`;
        const cmd2 = `\n${OPTION_INDENT}${colorize('$', 'dim')} ${context.name} ${exampleValue}`;
        examples.push(desc2 + cmd2);
      }
    }

    // Example 3: With options if available
    if (context.options.size > 0) {
      const firstOption = Array.from(context.options.values())[0];
      if (firstOption) {
        const flagMatch = firstOption.flags.match(/(--[\w-]+)/);
        const flag = flagMatch ? flagMatch[0] : '--option';
        const desc3 = `\n${INDENT}${colorize('–', 'dim')} With options`;
        const cmd3 = `\n${OPTION_INDENT}${colorize('$', 'dim')} ${context.name} ${flag} value`;
        examples.push(desc3 + cmd3);
      }
    }

    // Example 4: Show help
    const descHelp = `\n${INDENT}${colorize('–', 'dim')} Show help information`;
    const cmdHelp = `\n${OPTION_INDENT}${colorize('$', 'dim')} ${context.name} --help`;
    examples.push(descHelp + cmdHelp);
  }

  return {
    title: 'Examples',
    content: examples.join('\n')
  };
};

/**
 * Format a help section
 */
export const formatSection = (section: HelpSection): string => {
  if (section.content.length === 0) {
    return '';
  }

  // Clean section format (like standard CLIs)
  const header = `${INDENT}${colorize(section.title + ':', 'bold')}`;
  const contentLines = section.content.split('\n');
  
  return `${header}\n\n${contentLines.join('\n')}`;
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
 * Convert argument context to usage string
 */
export const argumentToUsageString = (arg: ArgumentContext): string => {
  let usage = '';

  if (arg.required) {
    usage += `<${arg.name}>`;
  } else {
    usage += `[${arg.name}]`;
  }

  if (arg.variadic) {
    usage += '...';
  }

  return usage;
};

/**
 * Convert option context to string representation
 */
export const optionToString = (option: OptionContext): string => {
  // Parse flags (e.g., "-h, --help" or "--verbose")
  const flagParts = option.flags.split(',').map(f => f.trim());
  const flags = flagParts.join(', ');
  
  // Calculate padding for alignment (typical CLI uses ~30-35 chars for flags column)
  const FLAG_COLUMN_WIDTH = 35;
  const flagsLength = flags.length;
  const padding = Math.max(FLAG_COLUMN_WIDTH - flagsLength, 2);
  const spaces = ' '.repeat(padding);
  
  // Build description with metadata inline
  let desc = option.description || '';
  const metadata: string[] = [];
  
  if (option.defaultValue !== undefined) {
    metadata.push(`default: ${option.defaultValue}`);
  }
  
  if (option.choices && option.choices.length > 0) {
    metadata.push(`choices: ${option.choices.join(', ')}`);
  }
  
  if (option.required) {
    metadata.push('required');
  }
  
  // Add metadata to description if exists
  if (metadata.length > 0) {
    desc += ` ${colorize(`[${metadata.join(', ')}]`, 'dim')}`;
  }
  
  // Single line format: "    -h, --help                     Description here"
  return `${OPTION_INDENT}${colorize(flags, 'bold')}${spaces}${desc}`;
};
