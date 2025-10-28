import pc from "picocolors";

type Column = {
	name: string;
	width: number;
	align?: 'left' | 'center' | 'right';
};

type Row = Record<string, string>;

export function Table({
	columns,
	data,
	headerColor = "cyan",
	borderColor = "gray",
}: {
	columns: Column[];
	data: Row[];
	headerColor?: string;
	borderColor?: string;
}) {
	// สร้างเส้นขอบ
	const border = pc[borderColor](
		'┌' + columns.map(c => '─'.repeat(c.width + 2)).join('┬') + '┐'
	);
	
	// สร้าง header
	const header = columns.map(c => 
		pc[headerColor](c.name.padEnd(c.width).substring(0, c.width))
	).join(pc[borderColor](' │ '));
	
	// สร้างเส้นคั่น header
	const headerBorder = pc[borderColor](
		'├' + columns.map(c => '─'.repeat(c.width + 2)).join('┼') + '┤'
	);
	
	// สร้างแถวข้อมูล
	const rows = data.map(row => {
		return columns.map(c => {
			const value = row[c.name] || '';
			return value.padEnd(c.width).substring(0, c.width);
		}).join(pc[borderColor](' │ '));
	});
	
	// สร้างเส้นขอบล่าง
	const bottomBorder = pc[borderColor](
		'└' + columns.map(c => '─'.repeat(c.width + 2)).join('┴') + '┘'
	);
	
	return [
		border,
		pc[borderColor]('│ ') + header + pc[borderColor](' │'),
		headerBorder,
		...rows.map(row => pc[borderColor]('│ ') + row + pc[borderColor](' │')),
		bottomBorder
	].join('\n');
}
