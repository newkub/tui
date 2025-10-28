import { select as clackSelect } from "@clack/prompts";
import type { SelectOptions } from "@/components/prompts/base";

export async function select<T>(options: SelectOptions<T>): Promise<T> {
  const result = await clackSelect({
    message: options.message,
    options: options.options.map(opt => ({
      value: opt.value,
      label: opt.group ? `${opt.group} > ${opt.label}` : opt.label,
    })),
    initialValue: options.options[0]?.value,
  });

  return result as T;
}
