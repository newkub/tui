import pc from "picocolors";
import { createPrompt } from './base';

export async function AutocompletePrompt({
	message,
	choices,
	initialValue = "",
}: {
	message: string;
	choices: string[];
	initialValue?: string;
}) {
	let value = initialValue;
	let filteredChoices = choices;
	
	return createPrompt({
		message,
		onRender() {
			if (value) {
				filteredChoices = choices.filter(c => 
					c.toLowerCase().includes(value.toLowerCase())
				);
			}
			
			const displayChoices = filteredChoices.length 
				? filteredChoices 
				: [pc.dim('No matches found')];
			
			return [
				`${pc.cyan('?')} ${message} ${pc.dim('(type to filter)')}`,
				`> ${value}`,
				...displayChoices.map(c => `  ${c}`)
			].join('\n');
		},
		onKeyPress(key) {
			// Handle key input
		}
	});
}
