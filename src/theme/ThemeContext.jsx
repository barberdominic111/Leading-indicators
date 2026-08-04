import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { THEMES, THEME_ORDER, applyTheme } from './themes'

const STORAGE_KEY = 'li_theme'
const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return THEMES[saved] ? saved : 'warm'
  })

  useEffect(() => {
    applyTheme(themeKey)
    localStorage.setItem(STORAGE_KEY, themeKey)
  }, [themeKey])

  const cycleTheme = useCallback(() => {
    setThemeKey((prev) => {
      const idx = THEME_ORDER.indexOf(prev)
      return THEME_ORDER[(idx + 1) % THEME_ORDER.length]
    })
  }, [])

  const value = {
    themeKey,
    setThemeKey,
    cycleTheme,
    themeLabel: THEMES[themeKey].label,
    themes: THEME_ORDER.map((k) => ({ key: k, label: THEMES[k].label }))
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
