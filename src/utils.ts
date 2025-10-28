import pc from "picocolors";

export function loading(message: string) {
	const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
	let i = 0;

	const interval = setInterval(() => {
		process.stdout.write(`\r${pc.blue(frames[i])} ${message}`);
		i = (i + 1) % frames.length;
	}, 80);

	return {
		stop: () => {
			clearInterval(interval);
			process.stdout.write("\r".padEnd(message.length + 3, " ") + "\r");
		},
	};
}

export const colors = {
	info: pc.blue,
	success: pc.green,
	warning: pc.yellow,
	error: pc.red,
	highlight: pc.cyan,
};
