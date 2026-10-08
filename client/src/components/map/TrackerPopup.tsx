import { Box, Chip, Stack, Typography } from '@mui/material';
import type { Tracker, TrackerLocation } from '../../api/types';
import { formatRelativeTime } from '../../utils/relativeTime';

export function TrackerPopupContent({ tracker, location }: { tracker: Tracker; location: TrackerLocation }) {
  return (
    <Box sx={{ minWidth: 200 }}>
      <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
        {tracker.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" component="div">
        ID {tracker.id}
      </Typography>
      <Stack direction="row" spacing={0.5} sx={{ my: 1 }}>
        <Chip size="small" label={tracker.isDeployed ? 'Deployed' : 'Not deployed'} color={tracker.isDeployed ? 'primary' : 'default'} variant={tracker.isDeployed ? 'filled' : 'outlined'} />
        <Chip size="small" label={tracker.isActive ? 'Active' : 'Inactive'} color={tracker.isActive ? 'success' : 'default'} variant={tracker.isActive ? 'filled' : 'outlined'} />
      </Stack>
      <Typography variant="body2">
        Last seen <time dateTime={location.timestamp} title={new Date(location.timestamp).toLocaleString()}>{formatRelativeTime(location.timestamp)}</time>
      </Typography>
      <Typography variant="caption" color="text.secondary">
        ±{Math.round(location.accuracyMeters)} m
      </Typography>
    </Box>
  );
}
