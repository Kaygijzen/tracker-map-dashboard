import { Alert, Box, LinearProgress, Paper, Typography } from '@mui/material';

interface MapStatusProps {
  /** Only true for the first load; background refreshes don't show the progress bar. */
  loading: boolean;
  error: Error | null;
  /** The API answered successfully with no trackers. */
  empty?: boolean;
}

/** Loading/error/empty overlay shown above the map without shifting its layout. */
export function MapStatus({ loading, error, empty = false }: MapStatusProps) {
  return (
    <>
      {(loading || error) && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1100, pointerEvents: 'none' }}>
          {loading && <LinearProgress aria-label="Loading trackers" />}
          {error && (
            <Alert severity="error" sx={{ m: 2, pointerEvents: 'auto', boxShadow: 2 }}>
              Could not load trackers. {error.message}
            </Alert>
          )}
        </Box>
      )}
      {empty && (
        <Box
          sx={{ position: 'absolute', inset: 0, zIndex: 1050, display: 'grid', placeItems: 'center', pointerEvents: 'none', p: 2 }}
        >
          <Paper elevation={3} sx={{ p: 3, maxWidth: 360, textAlign: 'center', pointerEvents: 'auto' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              No trackers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add trackers to <code>keys.json</code> on the server and restart it.
            </Typography>
          </Paper>
        </Box>
      )}
    </>
  );
}
