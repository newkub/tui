import { confirm as clackConfirm } from "@clack/prompts";
import type { PromptOptions } from "@/components/prompts/base";

export async function confirm(
  options: PromptOptions & {
    confirmText?: string;
    cancelText?: string;
  }
): Promise<boolean> {
  const result = await clackConfirm({
    message: options.message,
    initialValue: true,
    confirmText: options.confirmText,
    cancelText: options.cancelText
  });

  return result as boolean;
}
