import pc from "picocolors";

type StatusType = 'success' | 'error' | 'warning' | 'info';

const statusIcons = {
	success: '✓',
	error: '✗',
	warning: '⚠',
	info: 'ℹ'
};

const statusColors = {
	success: 'green',
	error: 'red',
	warning: 'yellow',
	info: 'blue'
};

export function Status({
	type,
	message,
}: {
	type: StatusType;
	message: string;
}) {
	const icon = statusIcons[type];
	const color = statusColors[type];
	
	return `${pc[color](icon)} ${message}`;
}
