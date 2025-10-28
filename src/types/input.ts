import { PromptOptions } from './component';

export type InputVariant = 'text' | 'number' | 'password' | 'email' | 'tel';

export interface TextInputProps {
  /** Input type */
  type: 'text' | 'password' | 'email' | 'tel';
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  defaultValue?: string;
  /** Is input disabled */
  disabled?: boolean;
  /** Validation regex pattern */
  pattern?: string;
  /** Accessibility attributes */
  ariaLabel?: string;
  ariaDescribedby?: string;
  tabIndex?: number;
}

export function isTextInputProps(props: unknown): props is TextInputProps {
  return (
    typeof props === 'object' &&
    props !== null &&
    'type' in props &&
    ['text', 'password', 'email', 'tel'].includes((props as TextInputProps).type)
  );
}

export interface TextInputOptions extends PromptOptions, TextInputProps {
}

export interface PasswordInputOptions extends PromptOptions {
  minLength?: number;
  confirm?: boolean;
  strengthMeter?: boolean;
}

export interface NumberInputProps {
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step value */
  step?: number;
  /** Default value */
  defaultValue?: number;
  /** Is input disabled */
  disabled?: boolean;
  /** Accessibility attributes */
  ariaLabel?: string;
  ariaDescribedby?: string;
  tabIndex?: number;
}

export interface NumberInputOptions extends PromptOptions, NumberInputProps {
  displayRange?: boolean;
}

export interface SelectInputOptions<T> extends PromptOptions {
  options: { value: T; label: string; group?: string }[];
  initialValue?: T;
}

export interface MultiSelectInputOptions<T> extends PromptOptions {
  options: { value: T; label: string; group?: string }[];
  maxSelected?: number;
}

export interface AutocompleteInputOptions extends PromptOptions {
  message: string;
  choices: string[];
  initialValue?: string;
}

export interface ConfirmInputOptions extends PromptOptions {
  initialValue?: boolean;
}

export interface SearchInputOptions<T> extends PromptOptions {
  options: { value: T; label: string }[];
}

export type InputOptions =
  | TextInputOptions
  | PasswordInputOptions
  | NumberInputOptions
  | SelectInputOptions<any>
  | MultiSelectInputOptions<any>
  | AutocompleteInputOptions
  | ConfirmInputOptions
  | SearchInputOptions<any>;

export type InputProps =
  | { variant: 'text'; props: TextInputProps }
  | { variant: 'number'; props: NumberInputProps }
  | { variant: 'select'; props: SelectInputOptions<any> }
  | { variant: 'checkbox'; props: any };
