import { AutocompletePrompt } from './autocomplete';
import type { PromptOptions } from '../prompt';

export async function search<T>({
  message,
  options,
}: {
  message: string;
  options: { value: T; label: string }[];
}): Promise<T> {
  const selected = await AutocompletePrompt({
    message,
    choices: options.map(opt => opt.label),
  });
  
  return options.find(opt => opt.label === selected)!.value;
}

export { AutocompletePrompt as searchPrompt } from './autocomplete';
