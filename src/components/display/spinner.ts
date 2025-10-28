import pc from "picocolors";
import { displayConfig } from "@/config/display.config";

export function Spinner({
  size = displayConfig.spinner.size,
  color = displayConfig.spinner.color,
  speed = displayConfig.spinner.speed,
}: {
  size?: "sm" | "md" | "lg" | number;
  color?: string;
  speed?: "slow" | "normal" | "fast";
}) {
  const sizeMap = {
    sm: 1,
    md: 2,
    lg: 3,
  };
  
  const speedMap = {
    slow: 200,
    normal: 100,
    fast: 50,
  };
  
  const actualSize = typeof size === 'string' ? sizeMap[size] : size;
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const interval = speedMap[speed];
  const frame = frames[Math.floor(Date.now() / interval) % frames.length];
  
  return pc[color]?.(frame.repeat(actualSize)) || frame.repeat(actualSize);
}
