import { CssBaseline, GlobalStyles, ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { useMemo, type ReactNode } from 'react';

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });

  const theme = useMemo(
    () => createTheme({ palette: { mode: prefersDark ? 'dark' : 'light' } }),
    [prefersDark],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={(t) => ({
          '.leaflet-popup-content-wrapper, .leaflet-popup-tip': {
            background: t.palette.background.paper,
            color: t.palette.text.primary,
          },
          '.leaflet-container a.leaflet-popup-close-button': { color: t.palette.text.secondary },
          '.leaflet-container': { fontFamily: t.typography.fontFamily },
          '.leaflet-popup-content p': { margin: 0 },
        })}
      />
      {children}
    </ThemeProvider>
  );
}
