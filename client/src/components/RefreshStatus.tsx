import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import { useNow } from '../hooks/useNow';
import { formatRelativeTime } from '../utils/relativeTime';

interface RefreshStatusProps {
  lastUpdated: Date | null;
  refreshing: boolean;
  onRefresh: () => void;
}

export function RefreshStatus({ lastUpdated, refreshing, onRefresh }: RefreshStatusProps) {
  const now = useNow();
  const label = lastUpdated ? `Last updated ${formatRelativeTime(lastUpdated.toISOString(), now)}` : 'Not updated yet';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, opacity: 0.85 }} aria-live="polite">
        {label}
      </Typography>
      <Tooltip title={label}>
        <span>
          <IconButton color="inherit" aria-label="Refresh trackers" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? (
              <CircularProgress size={20} color="inherit" aria-label="Refreshing" />
            ) : (
              <RefreshIcon />
            )}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
