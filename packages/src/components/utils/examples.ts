import { divider, section } from "../ui/line";

export interface ExampleOptions {
	title?: string;
	description?: string;
	delay?: number;
}

export interface ComponentExample {
	name: string;
	options?: ExampleOptions;
	showExample: () => Promise<void>;
}

export async function showComponentExample(
	componentName: string,
	example: () => Promise<void>,
	options: ExampleOptions = {},
): Promise<void> {
	const { title, description, delay = 800 } = options;

	section(`Component: ${componentName}`, { width: 60 });

	if (title) {
		console.log(`🔍  ${title}`);
	}

	if (description) {
		console.log(`ℹ️  ${description}`);
	}

	// Show the example
	await example();
	divider({ width: 60 });

	// Add delay between examples
	if (delay > 0) {
		await new Promise((resolve) => setTimeout(resolve, delay));
	}
}
