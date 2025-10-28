import { text } from "@clack/prompts";
import type { NumberOptions } from "./base";

export async function number(
  options: NumberOptions,
): Promise<number> {
  const result = await text({
    message: options.message,
    placeholder: "Enter a number",
    validate: (value) => {
      const num = Number(value);
      if (isNaN(num)) return "Please enter a valid number";
      if (options.min !== undefined && num < options.min)
        return `Number must be at least ${options.min}`;
      if (options.max !== undefined && num > options.max)
        return `Number must be at most ${options.max}`;
    },
  });

  return Number(result);
}
