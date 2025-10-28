import pc from "picocolors";
import { codeToANSI } from '@shikijs/cli';
import type { CodeBlockProps } from '../../types';

export async function CodeBlock({
  code,
  language = "",
  showLineNumbers = false,
}: CodeBlockProps) {
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
      return pc.gray('│ ') + lineNum + line + ' '.repeat(maxLength - line.length) + pc.gray(' │');
    }),
    bottomBorder,
  ].join('\n');
}
