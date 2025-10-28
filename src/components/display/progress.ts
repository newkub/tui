import pc from "picocolors";
import { defaultConfig } from "@/config";

export function ProgressBar({
  value,
  max = 100,
  width = defaultConfig.progress.width,
  color = defaultConfig.progress.color,
  showPercentage = defaultConfig.progress.showPercentage,
  labelPosition = defaultConfig.progress.labelPosition,
  animated = defaultConfig.progress.animated,
}: {
  value: number;
  max?: number;
  width?: number;
  color?: string;
  showPercentage?: boolean;
  labelPosition?: 'left' | 'right' | 'top' | 'bottom';
  animated?: boolean;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const filled = Math.floor((percentage / 100) * width);
  const empty = width - filled;
  
  const bar = animated 
    ? pc[color]('█'.repeat(filled) + (filled < width ? '▌' : '')) + pc.dim('░'.repeat(empty))
    : pc[color]('█'.repeat(filled)) + pc.dim('░'.repeat(empty));
  
  const percentageText = showPercentage ? ` ${percentage.toFixed(1)}%` : '';
  
  switch(labelPosition) {
    case 'left': return `${percentageText} ${bar}`;
    case 'top': return `${percentageText}\n${bar}`;
    case 'bottom': return `${bar}\n${percentageText}`;
    default: return `${bar}${percentageText}`;
  }
}
