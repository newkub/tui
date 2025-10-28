import pc from "picocolors";
import { codeToANSI } from '@shikijs/cli';
import { defaultConfig } from "@/config";

export async function CodeBlock({
  code,
  language = "",
  showLineNumbers = defaultConfig.codeblock.showLineNumbers,
  highlightLines = defaultConfig.codeblock.highlightLines,
}: {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
}) {
  const lines = code.split('\n');
  const maxLength = Math.max(...lines.map(line => line.length));
  
  const highlighted = language 
    ? await codeToANSI(code, language, 'nord')
    : lines.map(line => pc.cyan(line));
  
  const border = pc.gray('┌' + '─'.repeat(maxLength + 2) + '┐');
  const bottomBorder = pc.gray('└' + '─'.repeat(maxLength + 2) + '┘');
  
  return [
    border,
    ...highlighted.split('\n').map((line, i) => {
      const lineNum = showLineNumbers ? pc.dim(`${i + 1} │ `) : '';
      const isHighlighted = highlightLines.includes(i + 1);
      const lineContent = isHighlighted ? pc.bgBlue(line) : line;
      return pc.gray('│ ') + lineNum + lineContent + ' '.repeat(maxLength - line.length) + pc.gray(' │');
    }),
    bottomBorder,
    pc.dim('(Press Ctrl+C to copy)'),
  ].join('\n');
}
