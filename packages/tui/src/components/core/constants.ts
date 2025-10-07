export const SYMBOLS = {
	CHECKMARK: "✓",
	CROSS: "✖",
	WARNING: "⚠",
	INFO: "ℹ",
	BULLET: "•",
	ARROW_UP: "↑",
	ARROW_DOWN: "↓",
	ARROW_LEFT: "←",
	ARROW_RIGHT: "→",
	RADIO_ON: "◉",
	RADIO_OFF: "◯",
	CHECKBOX_ON: "☑",
	CHECKBOX_OFF: "☐",
	SPINNER: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
	ELLIPSIS: "…",
	VERTICAL_LINE: "│",
	HORIZONTAL_LINE: "─",
	CORNER_TOP_LEFT: "┌",
	CORNER_TOP_RIGHT: "┐",
	CORNER_BOTTOM_LEFT: "└",
	CORNER_BOTTOM_RIGHT: "┘",
	T_JUNCTION: "├",
	CROSS_JUNCTION: "┼",
	RIGHT_T_JUNCTION: "┤",
} as const;

export const KEYS = {
	ENTER: "enter",
	ESCAPE: "escape",
	SPACE: "space",
	TAB: "tab",
	BACKSPACE: "backspace",
	DELETE: "delete",
	UP: "up",
	DOWN: "down",
	LEFT: "left",
	RIGHT: "right",
	CTRL_C: "ctrl+c",
	CTRL_D: "ctrl+d",
} as const;

export const DEFAULTS = {
	SPINNER_SPEED: 80,
	CURSOR_HIDE: "\u001b[?25l",
	CURSOR_SHOW: "\u001b[?25h",
	CLEAR_LINE: "\u001b[2K\u001b[0G",
	MOVE_CURSOR_UP: "\u001b[1A",
	RESET: "\u001b[0m",
} as const;

export const VALIDATION = {
	REQUIRED: "This field is required",
	INVALID_NUMBER: "Please enter a valid number",
	INVALID_EMAIL: "Please enter a valid email address",
	TOO_SHORT: (min: number) => `Must be at least ${min} characters`,
	TOO_LONG: (max: number) => `Must be no more than ${max} characters`,
	OUT_OF_RANGE: (min: number, max: number) =>
		`Must be between ${min} and ${max}`,
} as const;
