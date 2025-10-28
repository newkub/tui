import pc from "picocolors";

export function ProgressBar({
	value,
	max = 100,
	width = 20,
	color = "cyan",
}: {
	value: number;
	max?: number;
	width?: number;
	color?: string;
}) {
	const percentage = Math.min(100, Math.max(0, (value / max) * 100));
	const filled = Math.floor((percentage / 100) * width);
	const empty = width - filled;
	
	const bar = 
		pc[color]('█'.repeat(filled)) + 
		pc.dim('░'.repeat(empty)) + 
		` ${percentage.toFixed(1)}%`;
	
	return bar;
}
