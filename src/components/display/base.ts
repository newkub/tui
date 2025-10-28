// Display Types
export interface BoxProps {
  title?: string;
  border?: boolean;
  padding?: number;
  children?: string;
}

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export interface ProgressProps {
  value: number;
  max?: number;
  showPercentage?: boolean;
}

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    width?: number;
    render?: (item: T) => React.ReactNode;
  }[];
}

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
}

export interface StatusProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}
