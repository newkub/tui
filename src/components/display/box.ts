import { displayConfig } from "@/config/display.config";
import boxen from 'boxen';

export const Box = ({
  title,
  border = displayConfig.box.border,
  padding = displayConfig.box.padding,
  children = '',
  width = displayConfig.box.width,
}: {
  title?: string;
  border?: boolean | 'single' | 'double' | 'round';
  padding?: number | { top: number; right: number; bottom: number; left: number };
  children?: string;
  width?: number;
}) => {
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
