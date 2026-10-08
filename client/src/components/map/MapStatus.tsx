import { Alert, Box, LinearProgress } from '@mui/material';

/** Loading/error overlay shown above the map without shifting its layout. */
export function MapStatus({ loading, error }: { loading: boolean; error: Error | null }) {
  if (!loading && !error) return null;
  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1100, pointerEvents: 'none' }}>
      {loading && <LinearProgress aria-label="Loading trackers" />}
      {error && (
        <Alert severity="error" sx={{ m: 2, pointerEvents: 'auto', boxShadow: 2 }}>
          Could not load trackers. {error.message}
        </Alert>
      )}
    </Box>
  );
}
