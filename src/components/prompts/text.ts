import { text as clackText } from "@clack/prompts";
import type { PromptOptions } from "@/components/prompts/base";
import pc from "picocolors";

export async function text(options: PromptOptions): Promise<string> {
  const result = await clackText({
    message: options.message,
    placeholder: options.placeholder,
    validate: options.validate,
  });
  
  return result as string;
}
