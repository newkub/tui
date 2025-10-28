import pc from 'picocolors';

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
