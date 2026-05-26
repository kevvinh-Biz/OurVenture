'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';

/**
 * Thin wrapper around next-themes for future use. The MVP intentionally
 * ships light-mode only (see MVP-SPEC.md §14), so this is not mounted yet
 * — wire it into `app/layout.tsx` when dark mode is in scope.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
