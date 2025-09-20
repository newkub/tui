import { colors } from "../utils/colors";

export interface NoteOptions {
	title: string;
	body?: string;
}

export function note(options: NoteOptions): void {
	const { title, body } = options;

	console.log(`${colors.info("ℹ")} ${colors.bold(title)}`);
	if (body) {
		console.log(body);
	}
	console.log();
}
