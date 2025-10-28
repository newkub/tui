import { textPrompt } from "./input";
import pc from "picocolors";
import { inputConfig } from "@/config/input.config";

export async function number(
  options: {
    message: string;
    min?: number;
    max?: number;
    displayRange?: boolean;
  },
): Promise<number> {
  const rangeDisplay = options.displayRange 
    ? pc.dim(` (${options.min ?? '-'} to ${options.max ?? '-'})`)
    : '';
    
  const result = await textPrompt({
    message: `${options.message}${rangeDisplay}`,
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
