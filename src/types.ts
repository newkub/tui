export interface BoxProps {
  title?: string;
  border?: boolean | 'single' | 'double' | 'round';
  padding?: number | { top: number; right: number; bottom: number; left: number };
  children?: string;
  width?: number;
  defaultBorder?: boolean;
  defaultPadding?: number;
  defaultWidth?: number;
}

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
}

export interface ProgressProps {
  value: number;
  max?: number;
  showPercentage?: boolean;
  labelPosition?: 'left' | 'right' | 'top' | 'bottom';
  animated?: boolean;
}

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | number;
  color?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

export interface TableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    width?: number;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
  }[];
  pagination?: {
    pageSize: number;
    currentPage: number;
  };
}

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
}

export interface StatusProps {
  type: 'info' | 'success' | 'warning' | 'error' | 'loading' | 'question' | 'star';
  message: string;
}

export interface TextProps {
  children: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  wrap?: boolean;
}

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

export interface BasePromptOptions {
  message: string;
  onRender: () => string;
  onKeyPress: (key: string) => void;
  onExit?: () => void;
}

export interface ConfirmPromptOptions extends PromptOptions {
  confirmText?: string;
  cancelText?: string;
  initialValue?: boolean;
}

export interface AutocompleteOptions extends PromptOptions {
  choices: string[];
  initialValue?: string;
}