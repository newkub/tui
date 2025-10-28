import { multiselect as clackMultiselect } from "@clack/prompts";
import { defaultConfig } from "@/config";

export async function multiselect<T>(
  options: {
    message: string;
    options: { value: T; label: string; group?: string }[];
    maxSelected?: number;
  }
): Promise<T[]> {
  const result = await clackMultiselect({
    message: options.message,
    options: options.options.map(opt => ({
      value: opt.value,
      label: opt.label,
    })),
    required: false,
    maxSelected: options.maxSelected,
  });

  return result as T[];
}
