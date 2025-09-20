export interface BaseOptions {
	message: string;
}

export interface InputOptions extends BaseOptions {
	defaultValue?: string;
	placeholder?: string;
	validate?: (value: string) => string | boolean;
}

export interface SelectOption<T = string> {
	label: string;
	value: T;
	hint?: string;
}

export interface SelectOptions<T = string> extends BaseOptions {
	options: SelectOption<T>[];
	initialValue?: T;
}

export interface MultiSelectOptions<T = string> extends BaseOptions {
	options: SelectOption<T>[];
	initialValues?: T[];
	required?: boolean;
}

export interface ConfirmOptions extends BaseOptions {
	initialValue?: boolean;
}

export interface TextOptions extends InputOptions {
	defaultValue?: string;
	placeholder?: string;
}

export interface PasswordOptions extends BaseOptions {
	placeholder?: string;
	mask?: string;
	validate?: (value: string) => string | boolean;
	initialValue?: string;
}

export interface NumberOptions extends BaseOptions {
	defaultValue?: number;
	min?: number;
	max?: number;
	placeholder?: string;
}

export interface ToggleOptions extends BaseOptions {
	defaultValue?: boolean;
	active?: string;
	inactive?: string;
}

export interface ProgressOptions {
	message?: string;
	total?: number;
	current?: number;
}

export interface TableOptions {
	data: Record<string, unknown>[];
	columns?: Array<{
		key: string;
		label: string;
		width?: number;
		align?: "left" | "center" | "right";
	}>;
}

export interface SpinnerOptions {
	message?: string;
}

export interface IntroOptions {
	title: string;
	tagLine?: string;
}

export interface NoteOptions {
	title: string;
	body?: string;
}

export interface LogOptions {
	message: string;
	symbol?: string;
}
