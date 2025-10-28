import pc from "picocolors";
import type { SpinnerProps } from "@/types";

export function Spinner({
  size = "md",
  color = "cyan",
  speed = "normal",
}: SpinnerProps) {
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
