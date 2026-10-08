import { Chip, Stack, type SxProps, type Theme } from '@mui/material';
import type { Tracker } from '../../api/types';

interface StatusChipsProps {
  tracker: Pick<Tracker, 'isDeployed' | 'isActive'>;
  /** Adds an "Outdated" chip when the location is older than the stale threshold. */
  stale?: boolean;
  sx?: SxProps<Theme>;
}

export function StatusChips({ tracker, stale = false, sx }: StatusChipsProps) {
  return (
    <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={sx}>
      <Chip
        size="small"
        label={tracker.isDeployed ? 'Deployed' : 'Not deployed'}
        color={tracker.isDeployed ? 'primary' : 'default'}
        variant={tracker.isDeployed ? 'filled' : 'outlined'}
      />
      <Chip
        size="small"
        label={tracker.isActive ? 'Active' : 'Inactive'}
        color={tracker.isActive ? 'success' : 'default'}
        variant={tracker.isActive ? 'filled' : 'outlined'}
      />
      {stale && <Chip size="small" label="Outdated" color="warning" variant="outlined" />}
    </Stack>
  );
}
