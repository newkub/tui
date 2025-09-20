export interface PromptOptions {
	message: string;
}

export interface TextOptions extends PromptOptions {
	placeholder?: string;
	defaultValue?: string;
	validate?: (value: string) => boolean | string;
}

export interface SelectOption<T = unknown> {
	label: string;
	value: T;
	hint?: string;
}

export interface SelectOptions<T = unknown> extends PromptOptions {
	options: SelectOption<T>[];
	initialValue?: T;
}

export interface MultiSelectOptions<T = unknown> extends PromptOptions {
	options: SelectOption<T>[];
	initialValues?: T[];
	required?: boolean;
}

export interface ConfirmOptions extends PromptOptions {
	initialValue?: boolean;
}

export interface SpinnerOptions {
	message?: string;
}

export interface PromptState {
	value: unknown;
	error?: string;
	submitted: boolean;
	cancelled: boolean;
}

export type PromptResult<T> = T | symbol;

export const CANCEL_SYMBOL = Symbol("cancel");

export function isCancel(value: unknown): value is symbol {
	return value === CANCEL_SYMBOL;
}
