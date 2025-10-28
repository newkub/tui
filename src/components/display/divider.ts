import pc from "picocolors";
import { displayConfig } from "@/config/display.config";

export function Divider({
  type = displayConfig.divider.type,
  length = displayConfig.divider.length,
  color = displayConfig.divider.color,
  character = displayConfig.divider.character,
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
