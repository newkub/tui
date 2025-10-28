import { select as clackSelect } from "@clack/prompts";
import { defaultConfig } from "@/config";

export async function select<T>(options: {
  message: string;
  options: { value: T; label: string; group?: string }[];
  initialValue?: T;
}): Promise<T> {
  const result = await clackSelect({
    message: options.message,
    options: options.options.map(opt => ({
      value: opt.value,
      label: opt.group ? `${opt.group} > ${opt.label}` : opt.label,
    })),
    initialValue: options.initialValue,
  });

  return result as T;
}
