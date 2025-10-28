import { displayConfig } from './display.config';
import { inputConfig } from './input.config';

export const defaultConfig = {
  display: displayConfig,
  input: inputConfig
} as const;
