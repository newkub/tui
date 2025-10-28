import pc from "picocolors";

export function Text({
	children,
	color = "white",
	bold = false,
	italic = false,
	underline = false,
}: {
	children: string;
	color?: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
}) {
	let text = pc[color]?.(children) || children;
	
	if (bold) text = pc.bold(text);
	if (italic) text = pc.italic(text);
	if (underline) text = pc.underline(text);
	
	return text;
}
