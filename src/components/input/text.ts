import { textPrompt } from "./prompt";
import pc from "picocolors";
import { inputConfig } from "@/config/input.config";

export async function text(options: {
  message: string;
  placeholder?: string;
  validate?: (value: string) => string | void;
}): Promise<string> {
  if (options.placeholder) {
    options.message = `${options.message} ${pc.dim(options.placeholder)}`;
  }
  
  return textPrompt({
    message: options.message,
    validate: options.validate
  });
}
