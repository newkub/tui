import pc from 'picocolors';

// Prompt Types
export interface PromptOptions {
  message: string;
  placeholder?: string;
}

export interface SelectOptions<T> extends PromptOptions {
  options: { value: T; label: string }[];
}

export interface PasswordOptions extends PromptOptions {
  minLength?: number;
  confirm?: boolean;
}

export interface NumberOptions extends PromptOptions {
  min?: number;
  max?: number;
}

// Base Prompt Implementation
type BasePromptOptions = {
  message: string;
  onRender: () => string;
  onKeyPress: (key: string) => void;
};

export function createPrompt(options: BasePromptOptions) {
  const { message, onRender, onKeyPress } = options;
  
  return {
    render: onRender,
    handleKey: onKeyPress
  };
}
