import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MapStatus } from './MapStatus';

describe('MapStatus', () => {
  it('shows a progress bar while loading', () => {
    render(<MapStatus loading error={null} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows an error alert and no progress bar on failure', () => {
    render(<MapStatus loading={false} error={new Error('The tracker API responded with 500.')} />);
    expect(screen.getByRole('alert')).toHaveTextContent('responded with 500');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders nothing when idle', () => {
    const { container } = render(<MapStatus loading={false} error={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
