/**
 * Examples demonstrating TUI Command CLI framework usage (Functional Programming style)
 */

import { Effect } from "effect";
import { createCommand } from "./command";

/**
 * Example 1: Basic command with options and arguments
 */
export function createBasicExample() {
  return createCommand({ name: 'myapp', description: 'A simple CLI application built with TUI Command' })
    .version('1.0.0')
    .argument('<input>', 'Input file to process', true)
    .argument('[output]', 'Output file destination')
    .option('-v, --verbose', 'Enable verbose output')
    .option('-f, --format <type>', 'Output format (json|yaml)', 'json')
    .option('-c, --count <number>', 'Number of items to process', 10)
    .option('--dry-run', 'Show what would be done without doing it')
    .action(async (options: Record<string, any>, input: string, output?: string) => {
      console.log('Processing:', { input, output, options });
    });
}

/**
 * Example 2: Command with subcommands
 */
export function createSubcommandsExample() {
  const program = createCommand({ name: 'git', description: 'A simple git-like CLI' });

  // Add subcommands
  const initCmd = createCommand({ name: 'init', description: 'Initialize a new repository' })
    .action(() => {
      console.log('Initialized empty git repository');
    });

  const addCmd = createCommand({ name: 'add', description: 'Add file to staging area' })
    .argument('<file>', 'File to add', true)
    .action((options: Record<string, any>, file: string) => {
      console.log(`Added ${file} to staging area`);
    });

  const commitCmd = createCommand({ name: 'commit', description: 'Commit staged changes' })
    .option('-m, --message <msg>', 'Commit message')
    .action((options: Record<string, any>) => {
      const message = options['message'] || 'No commit message';
      console.log(`Committed with message: "${message}"`);
    });

  return program
    .command('init').action(initCmd.getContext().action!)
    .command('add').argument('<file>', 'File to add', true).action(addCmd.getContext().action!)
    .command('commit').option('-m, --message <msg>', 'Commit message').action(commitCmd.getContext().action!);
}

/**
 * Example 3: Advanced command with validation
 */
export function createAdvancedExample() {
  return createCommand({ name: 'deploy', description: 'Deploy application to various environments' })
    .argument('<environment>', 'Target environment', true)
    .argument('<version>', 'Version to deploy')
    .option('-f, --force', 'Force deployment even if there are warnings')
    .option('-t, --timeout <ms>', 'Deployment timeout in milliseconds', 30000)
    .option('-e, --env <env>', 'Environment variables file')
    .option('--rollback', 'Rollback on failure')
    .action(async (options: Record<string, any>, environment: string, version: string) => {
      // Validate environment
      const validEnvs = ['development', 'staging', 'production'];
      if (!validEnvs.includes(environment)) {
        throw new Error(`Invalid environment: ${environment}. Must be one of: ${validEnvs.join(', ')}`);
      }

      console.log('Deploying:', {
        environment,
        version,
        force: options['force'],
        timeout: options['timeout'],
        envFile: options['env'],
        rollback: options['rollback']
      });

      // Simulate deployment
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Deployment completed successfully');
    });
}

/**
 * Example 4: Command that demonstrates help system
 */
export function createHelpExample() {
  return createCommand({ name: 'help-demo', description: 'Demonstrates the help system' })
    .option('-v, --verbose', 'Show detailed output')
    .option('--color <when>', 'When to use colors (always|never|auto)', 'auto')
    .argument('[files...]', 'Files to process')
    .action((options: Record<string, any>, ...files: string[]) => {
      console.log('Help demo:', { options, files });
    });
}

/**
 * Run examples (for development/testing purposes)
 */
if (import.meta.main) {
  const examples = [
    createBasicExample(),
    createSubcommandsExample(),
    createAdvancedExample(),
    createHelpExample()
  ];

  // Demonstrate help output
  examples.forEach(async (example, index) => {
    try {
      const helpText = await Effect.runPromise(example.help());
      console.log(`=== Example ${index + 1} Help ===`);
      console.log(helpText);
      console.log('');
    } catch (error) {
      console.error(`Error generating help for example ${index + 1}:`, error);
    }
  });
}
