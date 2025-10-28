import pc from "picocolors";

export function Spinner({
	size = 1,
	color = "cyan",
}: {
	size?: number;
	color?: string;
}) {
	const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
	const frame = frames[Math.floor(Date.now() / 100) % frames.length];
	return pc[color]?.(frame.repeat(size)) || frame.repeat(size);
}
