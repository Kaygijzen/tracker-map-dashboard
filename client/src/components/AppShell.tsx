import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Drawer, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export const DRAWER_WIDTH = 320;

interface SidebarContextValue {
  /** Closes the temporary drawer on mobile; no-op on desktop. */
  closeMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({ closeMobileSidebar: () => {} });

export const useSidebar = () => useContext(SidebarContext);

interface AppShellProps {
  sidebar: ReactNode;
  /** Rendered at the right side of the app bar. */
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell({ sidebar, actions, children }: AppShellProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarContext = useMemo(() => ({ closeMobileSidebar: () => setMobileOpen(false) }), []);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          {!isDesktop && (
            <IconButton
              color="inherit"
              edge="start"
              aria-label="Open tracker list"
              onClick={() => setMobileOpen((open) => !open)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="h1" noWrap sx={{ flexGrow: 1 }}>
            Tracker Map
          </Typography>
          {actions}
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isDesktop ? DRAWER_WIDTH : undefined,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, maxWidth: '85vw', boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <SidebarContext.Provider value={sidebarContext}>{sidebar}</SidebarContext.Provider>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Toolbar />
        <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>{children}</Box>
      </Box>
    </Box>
  );
}
