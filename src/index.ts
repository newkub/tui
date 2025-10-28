import {
	confirm,
	multiselect,
	number,
	password,
	select,
	text,
} from "./components";
import pc from "picocolors";

export async function main() {
	console.log(pc.bold(pc.blue("=== Welcome to TUI ===")));

	// Get user input
	const name = await text({
		message: pc.green("What is your name?"),
	});

	const age = await number({
		message: pc.green("How old are you?"),
		min: 0,
		max: 120,
	});

	const color = await select({
		message: pc.green("Choose your favorite color"),
		options: [
			{ value: "red", label: pc.red("Red") },
			{ value: "blue", label: pc.blue("Blue") },
			{ value: "green", label: pc.green("Green") },
		],
	});

	// Display summary
	console.log(pc.bold(`\nHello ${pc.cyan(name)}!`));
	console.log(pc.bold(`You are ${pc.yellow(age)} years old`));
	console.log(pc.bold(`Your favorite color is ${pc[color](color)}\n`));
}

main().catch(console.error);
