import { Box, Typography } from '@mui/material';
import type { Tracker, TrackerLocation } from '../../api/types';
import { StatusChips } from '../common/StatusChips';
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
      <StatusChips tracker={tracker} sx={{ my: 1 }} />
      <Typography variant="body2">
        Last seen <time dateTime={location.timestamp} title={new Date(location.timestamp).toLocaleString()}>{formatRelativeTime(location.timestamp)}</time>
      </Typography>
      <Typography variant="caption" color="text.secondary">
        ±{Math.round(location.accuracyMeters)} m
      </Typography>
    </Box>
  );
}
