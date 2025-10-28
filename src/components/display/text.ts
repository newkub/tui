import pc from "picocolors";
import { defaultConfig } from "@/config";

export function Text({
  children,
  color = defaultConfig.text.color,
  bold = defaultConfig.text.bold,
  italic = defaultConfig.text.italic,
  underline = defaultConfig.text.underline,
  align = defaultConfig.text.align,
  wrap = defaultConfig.text.wrap,
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
