import pc from "picocolors";
import type { DisplayType } from "@/types/display";

export const displayConfig: DisplayType = {
  responsive: {
    enabled: true,
    breakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280
    }
  },
  box: {
    border: true,
    padding: 1,
    width: 50,
  },
  codeblock: {
    showLineNumbers: false,
    highlightLines: [],
  },
  progress: {
    width: 20,
    color: "cyan",
    showPercentage: true,
    labelPosition: "right",
    animated: false,
  },
  spinner: {
    size: "md",
    color: "cyan",
    speed: "normal",
  },
  table: {
    headerColor: "cyan",
    borderColor: "gray",
  },
  text: {
    color: "white",
    bold: false,
    italic: false,
    underline: false,
    align: "left",
    wrap: true,
  }
} as const;
