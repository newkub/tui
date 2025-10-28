import boxen from 'boxen';
import type { BoxProps } from "@/types";

export const Box = ({
  title,
  border = true,
  padding = 1,
  children = '',
  width = 50,
}: BoxProps) => {
  const content = children;
  const boxContent = title ? `${title}\n\n${content}` : content;
  
  const borderStyles = {
    single: 'single',
    double: 'double',
    round: 'round',
  };
  
  const box = boxen(boxContent, {
    borderStyle: typeof border === 'string' ? borderStyles[border] || 'single' : 
               border ? 'single' : 'none',
    padding: typeof padding === 'number' ? padding : padding,
    textAlignment: 'left',
    width,
  });

  return box;
};

Box.displayName = 'Box'
