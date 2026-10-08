import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Tracker } from '../../api/types';
import { useSelection } from '../../state/selection';
import { filterTrackers } from '../../utils/filterTrackers';
import { formatRelativeTime } from '../../utils/relativeTime';
import { useSidebar } from '../AppShell';
import { StatusChips } from '../common/StatusChips';

function ColorDot({ color }: { color: string }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        bgcolor: color,
        border: 2,
        borderColor: 'background.paper',
        boxShadow: (t) => `0 0 0 1px ${t.palette.divider}`,
      }}
    />
  );
}

function TrackerListItem({
  tracker,
  selected,
  onSelect,
  itemRef,
}: {
  tracker: Tracker;
  selected: boolean;
  onSelect: (id: number) => void;
  itemRef: (el: HTMLDivElement | null) => void;
}) {
  const lastSeen = tracker.location ? formatRelativeTime(tracker.location.timestamp) : 'No location';
  return (
    <ListItemButton
      ref={itemRef}
      selected={selected}
      disabled={!tracker.location}
      onClick={() => tracker.location && onSelect(tracker.id)}
      alignItems="flex-start"
      data-tracker-id={tracker.id}
    >
      <ListItemAvatar sx={{ minWidth: 32, mt: 1 }}>
        <ColorDot color={tracker.color} />
      </ListItemAvatar>
      <ListItemText
        primary={tracker.name}
        primaryTypographyProps={{ noWrap: true, fontWeight: 500 }}
        secondary={
          <>
            <Box component="span" sx={{ display: 'block' }}>
              ID {tracker.id} · {lastSeen}
            </Box>
            <StatusChips tracker={tracker} sx={{ mt: 0.75 }} />
          </>
        }
        secondaryTypographyProps={{ component: 'div' }}
      />
    </ListItemButton>
  );
}

export function TrackerList({ trackers }: { trackers: Tracker[] }) {
  const [query, setQuery] = useState('');
  const { selectedId, source, select } = useSelection();
  const { closeMobileSidebar } = useSidebar();
  const itemRefs = useRef(new Map<number, HTMLDivElement>());
  const shown = useMemo(() => filterTrackers(trackers, query), [trackers, query]);

  useEffect(() => {
    if (selectedId === null || source !== 'map') return;
    itemRefs.current.get(selectedId)?.scrollIntoView?.({ block: 'nearest' });
  }, [selectedId, source]);

  const handleSelect = (id: number) => {
    select(id, 'list');
    closeMobileSidebar();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box sx={{ p: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          type="search"
          placeholder="Search by name or ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          inputProps={{ 'aria-label': 'Search trackers' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }} aria-live="polite">
          Showing {shown.length} of {trackers.length}
        </Typography>
      </Box>
      <List dense disablePadding sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }} aria-label="Trackers">
        {shown.map((tracker) => (
          <TrackerListItem
            key={tracker.id}
            tracker={tracker}
            selected={tracker.id === selectedId}
            onSelect={handleSelect}
            itemRef={(el) => {
              if (el) itemRefs.current.set(tracker.id, el);
              else itemRefs.current.delete(tracker.id);
            }}
          />
        ))}
        {shown.length === 0 && trackers.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>
            No trackers match “{query.trim()}”.
          </Typography>
        )}
      </List>
    </Box>
  );
}
