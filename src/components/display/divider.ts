import pc from "picocolors";
import { defaultConfig } from "@/config";

export function Divider({
  type = defaultConfig.divider.type,
  length = defaultConfig.divider.length,
  color = defaultConfig.divider.color,
  character = defaultConfig.divider.character,
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
