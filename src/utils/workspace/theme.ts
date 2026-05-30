import * as Blockly from 'blockly/core';

export interface ThemeOptions {
  workspaceBackgroundColour: string;
  toolboxBackgroundColour: string;
  toolboxForegroundColour: string;
  flyoutBackgroundColour: string;
  flyoutForegroundColour: string;
  flyoutOpacity: number;
  scrollbarColour: string;
  scrollbarOpacity: number;
}

/**
 * 默认主题配置
 */
const DEFAULT_THEME_OPTIONS: ThemeOptions = {
  workspaceBackgroundColour: '#ffffff',
  toolboxBackgroundColour: '#F9F9F9',
  toolboxForegroundColour: '#1C313A',
  flyoutBackgroundColour: '#F0F0F0',
  flyoutForegroundColour: '#1C313A',
  flyoutOpacity: 0.9,
  scrollbarColour: '#CCDAE0',
  scrollbarOpacity: 0.8
};

const DARK_THEME_OPTIONS: ThemeOptions = {
  workspaceBackgroundColour: '#1e1e1e',
  toolboxBackgroundColour: '#252526',
  toolboxForegroundColour: '#cccccc',
  flyoutBackgroundColour: '#2d2d2d',
  flyoutForegroundColour: '#cccccc',
  flyoutOpacity: 0.9,
  scrollbarColour: '#555555',
  scrollbarOpacity: 0.8
};

const LIGHT_THEME_NAME = 'cryptoThemeLight';
const DARK_THEME_NAME = 'cryptoThemeDark';
let lightTheme: Blockly.Theme | null = null;
let darkTheme: Blockly.Theme | null = null;

export function createBlocklyTheme(
  isDark = false,
  customOptions?: Partial<ThemeOptions>
): Blockly.Theme {
  const useCache = !customOptions;
  if (useCache) {
    const cached = isDark ? darkTheme : lightTheme;
    if (cached) return cached;
  }

  const defaults = isDark ? DARK_THEME_OPTIONS : DEFAULT_THEME_OPTIONS;
  const options = customOptions ? { ...defaults, ...customOptions } : defaults;
  const suffix = useCache ? '' : `_${Date.now()}`;
  const name = (isDark ? DARK_THEME_NAME : LIGHT_THEME_NAME) + suffix;
  const theme = Blockly.Theme.defineTheme(name, {
    name,
    base: Blockly.Themes.Classic,
    componentStyles: options
  });

  if (useCache) {
    if (isDark) darkTheme = theme;
    else lightTheme = theme;
  }
  return theme;
}
