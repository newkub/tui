import { text as clackText } from "@clack/prompts";
import pc from "picocolors";
import { defaultConfig } from "@/config";

export async function text(options: {
  message: string;
  placeholder?: string;
  validate?: (value: string) => string | void;
}): Promise<string> {
  const result = await clackText({
    message: options.message,
    placeholder: options.placeholder,
    validate: options.validate,
  });
  
  return result as string;
}
