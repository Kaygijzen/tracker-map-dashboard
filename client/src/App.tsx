import { Box, Typography } from '@mui/material';
import { AppShell } from './components/AppShell';

export default function App() {
  return (
    <AppShell
      sidebar={
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Trackers will appear here.
        </Typography>
      }
    >
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
        <Typography color="text.secondary">Map will appear here.</Typography>
      </Box>
    </AppShell>
  );
}
