import { createContext, useContext, useState, useEffect } from 'react'
import { getData, saveData } from '../utils/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [profile, setProfileState] = useState(() => getData('profile', null))
  const [theme, setThemeState] = useState(() => getData('theme', 'dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function setProfile(data) {
    saveData('profile', data)
    setProfileState(data)
  }

  function logout() {
    saveData('profile', null)
    setProfileState(null)
  }

  function setTheme(next) {
    saveData('theme', next)
    setThemeState(next)
  }

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        logout,
        isLoggedIn: !!profile,
        theme,
        setTheme
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
