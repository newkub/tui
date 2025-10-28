import pc from "picocolors";
import { createPrompt } from "./base";
import { defaultConfig } from "@/config";

export async function AutocompletePrompt({
  message,
  choices,
  initialValue = defaultConfig.autocomplete.initialValue,
}: {
  message: string;
  choices: string[];
  initialValue?: string;
}) {
  let value = initialValue;
  let filteredChoices = choices;
  let selectedIndex = 0;
  
  return createPrompt({
    message,
    onRender() {
      if (value) {
        filteredChoices = choices.filter(c => 
          c.toLowerCase().includes(value.toLowerCase())
        );
        selectedIndex = Math.min(selectedIndex, filteredChoices.length - 1);
      }
      
      const displayChoices = filteredChoices.length 
        ? filteredChoices 
        : [pc.dim('No matches found')];
      
      return [
        `${pc.cyan('?')} ${message} ${pc.dim('(type to filter)')}`,
        `> ${value}`,
        ...displayChoices.map((c, i) => 
          i === selectedIndex ? pc.inverse(` ${c} `) : `  ${c}`
        )
      ].join('\n');
    },
    onKeyPress(key) {
      if (key === 'ArrowUp') {
        selectedIndex = Math.max(0, selectedIndex - 1);
      } else if (key === 'ArrowDown') {
        selectedIndex = Math.min(filteredChoices.length - 1, selectedIndex + 1);
      } else if (key === 'Enter' && filteredChoices.length > 0) {
        value = filteredChoices[selectedIndex];
      }
    }
  });
}
