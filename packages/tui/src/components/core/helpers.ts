import { colors } from "./colors";
import { writeLine } from "./input";

export function intro(message: string): void {
	writeLine(`${colors.primary("┌")} ${colors.bold(message)}`);
	writeLine(`${colors.primary("│")}`);
}

export function outro(message: string): void {
	writeLine(`${colors.primary("│")}`);
	writeLine(`${colors.primary("└")} ${colors.dim(message)}`);
}

export function note(message: string): void {
	writeLine(`${colors.info("┌")} ${colors.dim(message)}`);
	writeLine(`${colors.info("└")}`);
}

export function log(message: string): void {
	writeLine(`${colors.dim("│")} ${colors.dim(message)}`);
}
