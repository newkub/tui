import { defaultConfig } from "@/config";
import pc from "picocolors";

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
}: {
  type: StatusType;
  message: string;
}) {
  const icon = statusIcons[type];
  const color = statusColors[type];
  
  return `${pc[color](icon)} ${message}`;
}
