import { confirm as clackConfirm } from "@clack/prompts";
import type { PromptOptions } from "./base";

export async function confirm(options: PromptOptions): Promise<boolean> {
  const result = await clackConfirm({
    message: options.message,
    initialValue: true,
  });

  return result as boolean;
}
