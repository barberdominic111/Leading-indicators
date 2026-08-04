// Theme engine — three calm, non-urgent palettes.
// Every value is consumed as a CSS custom property, so components
// never hardcode color and stay theme-agnostic.

export const THEMES = {
  warm: {
    label: 'Warm',
    tokens: {
      '--bg': '#F6F1EA',
      '--surface': '#FFFFFF',
      '--surface-alt': '#EDE6DA',
      '--surface-raised': '#FFFFFF',
      '--text': '#2B2521',
      '--text-muted': '#6B6055',
      '--border': '#E0D5C5',
      '--accent': '#B5764B',
      '--accent-soft': '#E9D3BE',
      '--accent-contrast': '#FFFFFF',
      '--success': '#6B8F71',
      '--warning': '#B98A2E',
      '--danger': '#AD5B45',
      '--shadow': '0 1px 2px rgba(43,37,33,0.06), 0 4px 16px rgba(43,37,33,0.05)'
    }
  },
  dark: {
    label: 'Dark',
    tokens: {
      '--bg': '#1B1B1D',
      '--surface': '#242426',
      '--surface-alt': '#2E2E31',
      '--surface-raised': '#2A2A2D',
      '--text': '#EDEAE5',
      '--text-muted': '#9C9892',
      '--border': '#38383B',
      '--accent': '#C98A5E',
      '--accent-soft': '#4A3A2E',
      '--accent-contrast': '#1B1B1D',
      '--success': '#7FA987',
      '--warning': '#D8B94A',
      '--danger': '#C97361',
      '--shadow': '0 1px 2px rgba(0,0,0,0.3), 0 6px 20px rgba(0,0,0,0.25)'
    }
  },
  light: {
    label: 'Light',
    tokens: {
      '--bg': '#F5F6F7',
      '--surface': '#FFFFFF',
      '--surface-alt': '#EDEFF2',
      '--surface-raised': '#FFFFFF',
      '--text': '#23262B',
      '--text-muted': '#6B7178',
      '--border': '#DEE2E7',
      '--accent': '#4C6B8A',
      '--accent-soft': '#D7E1EA',
      '--accent-contrast': '#FFFFFF',
      '--success': '#4F8F6B',
      '--warning': '#C79A2E',
      '--danger': '#A6564A',
      '--shadow': '0 1px 2px rgba(35,38,43,0.05), 0 4px 16px rgba(35,38,43,0.04)'
    }
  }
}

export const THEME_ORDER = ['warm', 'dark', 'light']

export function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES.warm
  const root = document.documentElement
  Object.entries(theme.tokens).forEach(([k, v]) => root.style.setProperty(k, v))
  root.setAttribute('data-theme', themeKey)
}
