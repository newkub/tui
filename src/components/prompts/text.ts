import { text as clackText } from "@clack/prompts";
import type { PromptOptions } from "./base";

export async function text(options: PromptOptions): Promise<string> {
  const result = await clackText({
    message: options.message,
    placeholder: options.placeholder,
  });
  
  return result as string;
}
