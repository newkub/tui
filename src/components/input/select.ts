import { selectPrompt } from "./input";
import { defaultConfig } from "@/config";

export async function select<T>(options: {
  message: string;
  options: { value: T; label: string; group?: string }[];
  initialValue?: T;
}): Promise<T> {
  const formattedOptions = options.options.map(opt => ({
    value: opt.value,
    label: opt.group ? `${opt.group} > ${opt.label}` : opt.label
  }));

  return selectPrompt({
    message: options.message,
    options: formattedOptions
  });
}
