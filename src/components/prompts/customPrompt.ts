import pc from 'picocolors';
import readline from 'readline';

interface PromptOptions {
  message: string;
  defaultValue?: string | boolean;
}

export class CustomPrompt {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async confirm(options: PromptOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.rl.question(
        `${pc.cyan('?')} ${options.message} ${pc.dim('(y/n)')} `,
        (answer) => {
          resolve(/^y$/i.test(answer));
        }
      );
    });
  }

  close() {
    this.rl.close();
  }
}
