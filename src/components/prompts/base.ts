import pc from 'picocolors';
import type { BoxProps, CodeBlockProps, ProgressProps, SpinnerProps, TableProps, DividerProps, StatusProps, TextProps } from "@/types";

// Prompt Types
export interface PromptOptions {
  message: string;
  placeholder?: string;
  validate?: (value: string) => string | void;
}

export interface SelectOptions<T> extends PromptOptions {
  options: { value: T; label: string; group?: string }[];
  searchable?: boolean;
}

export interface PasswordOptions extends PromptOptions {
  minLength?: number;
  confirm?: boolean;
  strengthMeter?: boolean;
}

export interface NumberOptions extends PromptOptions {
  min?: number;
  max?: number;
  step?: number;
  displayRange?: boolean;
}

// Base Prompt Implementation
type BasePromptOptions = {
  message: string;
  onRender: () => string;
  onKeyPress: (key: string) => void;
  onExit?: () => void;
};

export function createPrompt(options: BasePromptOptions) {
  const { message, onRender, onKeyPress, onExit } = options;
  
  return {
    render: onRender,
    handleKey: onKeyPress,
    exit: onExit || (() => {})
  };
}
