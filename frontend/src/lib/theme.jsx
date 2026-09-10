import { createContext, useContext, useEffect, useState } from 'react'

const ThemeProviderContext = createContext({ theme: 'system', setTheme: () => null, resolvedTheme: 'light' })

export function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'voiceguard-theme' }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(storageKey) ?? defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const compute = () => (theme === 'system' ? (media.matches ? 'dark' : 'light') : theme)

    const apply = () => {
      const resolved = compute()
      setResolvedTheme(resolved)
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
      root.style.colorScheme = resolved
    }

    apply()
    if (theme === 'system') {
      media.addEventListener('change', apply)
      return () => media.removeEventListener('change', apply)
    }
  }, [theme])

  const value = {
    theme,
    resolvedTheme,
    setTheme: (t) => {
      localStorage.setItem(storageKey, t)
      setTheme(t)
    },
  }

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => useContext(ThemeProviderContext)