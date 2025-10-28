import pc from "picocolors";
import type { TableProps } from "@/types";

type Column<T> = {
  name: string;
  width: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (item: T) => string;
};

type Row = Record<string, string>;

export function Table<T>({
  columns,
  data,
  pagination,
  headerColor = "cyan",
  borderColor = "gray",
}: TableProps<T>) {
  // Handle pagination
  const pageData = pagination 
    ? data.slice(
        (pagination.currentPage - 1) * pagination.pageSize,
        pagination.currentPage * pagination.pageSize
      )
    : data;

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
  const rows = pageData.map(row => {
    return columns.map(c => {
      const value = c.render ? c.render(row) : row[c.name] || '';
      return value.padEnd(c.width).substring(0, c.width);
    }).join(pc[borderColor](' │ '));
  });
  
  // สร้างเส้นขอบล่าง
  const bottomBorder = pc[borderColor](
    '└' + columns.map(c => '─'.repeat(c.width + 2)).join('┴') + '┘'
  );
  
  // เพิ่ม pagination info ถ้ามี
  const paginationInfo = pagination 
    ? pc.dim(`Page ${pagination.currentPage} of ${Math.ceil(data.length / pagination.pageSize)}`)
    : '';

  return [
    border,
    pc[borderColor]('│ ') + header + pc[borderColor](' │'),
    headerBorder,
    ...rows.map(row => pc[borderColor]('│ ') + row + pc[borderColor](' │')),
    bottomBorder,
    paginationInfo
  ].filter(Boolean).join('\n');
}
