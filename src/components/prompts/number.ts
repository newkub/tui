import { text } from "@clack/prompts";
import type { NumberOptions } from "@/components/prompts/base";
import pc from "picocolors";

export async function number(
  options: NumberOptions,
): Promise<number> {
  const rangeDisplay = options.displayRange 
    ? pc.dim(` (${options.min ?? '-'} to ${options.max ?? '-'})`)
    : '';
    
  const result = await text({
    message: `${options.message}${rangeDisplay}`,
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
