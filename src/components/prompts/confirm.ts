import pc from 'picocolors';
import { CustomPrompt } from './customPrompt';
import { defaultConfig } from "@/config";

export async function confirm(
  options: {
    message: string;
    initialValue?: boolean;
    confirmText?: string;
    cancelText?: string;
  }
): Promise<boolean> {
  const prompt = new CustomPrompt();
  const result = await prompt.confirm({
    message: options.message,
    defaultValue: options.initialValue ?? defaultConfig.confirm.initialValue
  });
  prompt.close();
  return result;
}
