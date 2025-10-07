export const colors = {
	primary: (text: string) => `\x1b[36m${text}\x1b[0m`, // cyan
	success: (text: string) => `\x1b[32m${text}\x1b[0m`, // green
	error: (text: string) => `\x1b[31m${text}\x1b[0m`, // red
	warning: (text: string) => `\x1b[33m${text}\x1b[0m`, // yellow
	info: (text: string) => `\x1b[34m${text}\x1b[0m`, // blue
	dim: (text: string) => `\x1b[2m${text}\x1b[0m`, // dim
	bold: (text: string) => `\x1b[1m${text}\x1b[0m`, // bold
	inverse: (text: string) => `\x1b[7m${text}\x1b[0m`, // inverse
	reset: (text: string) => `\x1b[0m${text}\x1b[0m`, // reset
} as const;

export function formatMessage(message: string): string {
	return colors.primary("?") + " " + colors.bold(message);
}

export function formatError(error: string): string {
	return colors.error("✖") + " " + colors.error(error);
}

export function formatSuccess(message: string): string {
	return colors.success("✓") + " " + colors.dim(message);
}

export function formatWarning(message: string): string {
	return colors.warning("⚠") + " " + colors.warning(message);
}

export function formatOption(
	label: string,
	isSelected: boolean = false,
): string {
	const prefix = isSelected ? colors.primary("❯") : " ";
	return `${prefix} ${isSelected ? colors.primary(label) : colors.dim(label)}`;
}

export function formatMultiOption(
	label: string,
	isSelected: boolean = false,
	isChecked: boolean = false,
): string {
	const checkbox = isChecked ? colors.success("◉") : "◯";
	const prefix = isSelected ? colors.primary("❯") : " ";
	return `${prefix} ${checkbox} ${isSelected ? colors.primary(label) : colors.dim(label)}`;
}
