import boxen from 'boxen';
import type { BoxProps } from '../../types';

export const Box = ({
  title,
  border = true,
  padding = 1,
  children = '',
}: BoxProps) => {
  const content = children;
  const boxContent = title ? `${title}\n\n${content}` : content;
  
  const box = boxen(boxContent, {
    borderStyle: border ? 'single' : 'none',
    padding,
    textAlignment: 'left',
  });

  return box;
};

Box.displayName = 'Box'
