import { colors } from "../utils/colors.js";

export interface IntroOptions {
	title: string;
	tagLine?: string;
}

export function intro(options: IntroOptions): void {
	const { title, tagLine } = options;

	console.log(colors.bold(colors.primary(title)));
	if (tagLine) {
		console.log(colors.dim(tagLine));
	}
	console.log();
}

export function outro(message: string): void {
	console.log(colors.bold(colors.primary(message)));
	console.log();
}
