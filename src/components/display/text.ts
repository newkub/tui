import pc from "picocolors";
import { displayConfig } from "@/config/display.config";

export function Text({
  children,
  color = displayConfig.text.color,
  bold = displayConfig.text.bold,
  italic = displayConfig.text.italic,
  underline = displayConfig.text.underline,
  align = displayConfig.text.align,
  wrap = displayConfig.text.wrap,
}: {
  children: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  wrap?: boolean;
}) {
  let text = pc[color]?.(children) || children;
  
  if (bold) text = pc.bold(text);
  if (italic) text = pc.italic(text);
  if (underline) text = pc.underline(text);
  
  // Handle alignment
  if (align === 'center') {
    const lines = text.split('\n');
    text = lines.map(line => {
      const padding = Math.max(0, process.stdout.columns - line.length);
      return ' '.repeat(Math.floor(padding / 2)) + line;
    }).join('\n');
  } else if (align === 'right') {
    const lines = text.split('\n');
    text = lines.map(line => {
      const padding = Math.max(0, process.stdout.columns - line.length);
      return ' '.repeat(padding) + line;
    }).join('\n');
  }
  
  // Handle wrapping
  if (wrap) {
    const lines = text.split('\n');
    text = lines.map(line => {
      if (line.length <= process.stdout.columns) return line;
      return line.match(new RegExp(`.{1,${process.stdout.columns}}`, 'g'))?.join('\n') || line;
    }).join('\n');
  }
  
  return text;
}
