import { password as clackPassword } from "@clack/prompts";
import type { PasswordOptions } from "./base";

export async function password(options: PasswordOptions): Promise<string> {
  const result = await clackPassword({
    message: options.message,
    mask: "•",
  });

  return result as string;
}
