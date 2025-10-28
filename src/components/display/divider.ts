import pc from "picocolors";
import type { DividerProps } from "@/types";

export function Divider({
  type = "horizontal",
  length = 20,
  color = "gray",
  character = "─",
}: DividerProps) {
  if (type === "horizontal") {
    return pc[color](character.repeat(length));
  } else {
    return pc[color](character + "\n").repeat(length);
  }
}
