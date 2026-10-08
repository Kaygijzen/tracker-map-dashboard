import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RefreshErrorSnackbar } from './RefreshErrorSnackbar';
import { RefreshStatus } from './RefreshStatus';

describe('RefreshStatus', () => {
  it('shows last updated and refreshes on click', () => {
    const onRefresh = vi.fn();
    render(<RefreshStatus lastUpdated={new Date(Date.now() - 2 * 60_000)} refreshing={false} onRefresh={onRefresh} />);
    expect(screen.getByText('Last updated 2 minutes ago')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Refresh trackers'));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('is disabled with progress while refreshing', () => {
    render(<RefreshStatus lastUpdated={new Date()} refreshing onRefresh={() => {}} />);
    expect(screen.getByLabelText('Refresh trackers')).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

describe('RefreshErrorSnackbar', () => {
  it('opens for a refresh error', () => {
    const { rerender } = render(<RefreshErrorSnackbar error={null} />);
    expect(screen.queryByText(/Couldn’t refresh trackers/)).not.toBeInTheDocument();
    rerender(<RefreshErrorSnackbar error={new Error('500')} />);
    expect(screen.getByText(/Couldn’t refresh trackers/)).toBeInTheDocument();
  });
});
