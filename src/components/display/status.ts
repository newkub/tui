import pc from "picocolors";
import type { StatusProps } from "@/types";

type StatusType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'question' | 'star';

const statusIcons = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
  loading: '↻',
  question: '?',
  star: '★'
};

const statusColors = {
  success: 'green',
  error: 'red',
  warning: 'yellow',
  info: 'blue',
  loading: 'cyan',
  question: 'magenta',
  star: 'yellow'
};

export function Status({
  type,
  message,
}: StatusProps) {
  const icon = statusIcons[type];
  const color = statusColors[type];
  
  return `${pc[color](icon)} ${message}`;
}
