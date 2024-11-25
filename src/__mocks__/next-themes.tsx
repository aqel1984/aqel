import React from 'react'

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const NextThemesProvider: React.FC<ThemeProviderProps> = ({ children }) => <>{children}</>