import { multiselect as clackMultiselect } from "@clack/prompts";
import type { SelectOptions } from "@/components/prompts/base";

export async function multiselect<T>(
  options: SelectOptions<T> & { maxSelected?: number }
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
