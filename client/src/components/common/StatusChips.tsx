import { Chip, Stack, type SxProps, type Theme } from '@mui/material';
import type { Tracker } from '../../api/types';

export function StatusChips({ tracker, sx }: { tracker: Pick<Tracker, 'isDeployed' | 'isActive'>; sx?: SxProps<Theme> }) {
  return (
    <Stack direction="row" spacing={0.5} sx={sx}>
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
    </Stack>
  );
}
