import { Alert, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';

/** Non-blocking notice for failed background refreshes; reopens for each new error. */
export function RefreshErrorSnackbar({ error }: { error: Error | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (error) setOpen(true);
  }, [error]);

  return (
    <Snackbar
      open={open && error !== null}
      autoHideDuration={6000}
      onClose={(_, reason) => reason !== 'clickaway' && setOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity="warning" variant="filled" onClose={() => setOpen(false)} sx={{ width: '100%' }}>
        Couldn’t refresh trackers — showing last known data.
      </Alert>
    </Snackbar>
  );
}
