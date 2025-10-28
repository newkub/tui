import type { BoxProps, CodeBlockProps, ProgressProps, SpinnerProps, TableProps, DividerProps, StatusProps, TextProps } from "@/types";

export const defaultConfig = {
  box: {
    border: true,
    padding: 1,
    width: 50,
  } as BoxProps,
  codeblock: {
    showLineNumbers: false,
    highlightLines: [],
  } as CodeBlockProps,
  progress: {
    width: 20,
    color: "cyan",
    showPercentage: true,
    labelPosition: "right",
    animated: false,
  } as ProgressProps,
  spinner: {
    size: "md",
    color: "cyan",
    speed: "normal",
  } as SpinnerProps,
  table: {
    headerColor: "cyan",
    borderColor: "gray",
  } as TableProps,
  text: {
    color: "white",
    bold: false,
    italic: false,
    underline: false,
    align: "left",
    wrap: true,
  } as TextProps,
};