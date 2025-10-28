import pc from "picocolors";

export function Divider({
	type = "horizontal",
	length = 20,
	color = "gray",
	character = "─",
}: {
	type?: "horizontal" | "vertical";
	length?: number;
	color?: string;
	character?: string;
}) {
	if (type === "horizontal") {
		return pc[color](character.repeat(length));
	} else {
		return pc[color](character + "\n").repeat(length);
	}
}
