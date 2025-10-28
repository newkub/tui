// Display Types
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

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
}

export interface StatusProps {
  type: 'info' | 'success' | 'warning' | 'error';
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
