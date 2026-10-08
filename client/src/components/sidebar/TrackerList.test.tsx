import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Tracker } from '../../api/types';
import { SelectionProvider, useSelection } from '../../state/selection';
import { TrackerList } from './TrackerList';

const fiveMinutesAgo = () => new Date(Date.now() - 5 * 60 * 1000).toISOString();
const trackers: Tracker[] = [
  { id: 6253030, name: 'rotokey_13', color: '#00ff00', isDeployed: true, isActive: false, location: { lat: 52.37, lng: 4.89, timestamp: fiveMinutesAgo(), accuracyMeters: 10 } },
  { id: 5253030, name: 'rotokey_13', color: '#00ff00', isDeployed: true, isActive: false, location: { lat: 52.36, lng: 4.88, timestamp: fiveMinutesAgo(), accuracyMeters: 10 } },
  { id: 42, name: 'Bike', color: '#ff0000', isDeployed: false, isActive: true, location: null },
];

function SelectedId() {
  return <output data-testid="selected">{String(useSelection().selectedId)}</output>;
}

function setup() {
  render(
    <SelectionProvider>
      <TrackerList trackers={trackers} />
      <SelectedId />
    </SelectionProvider>,
  );
}

const item = (id: number) => document.querySelector(`[data-tracker-id="${id}"]`) as HTMLElement;

describe('TrackerList', () => {
  it('renders every tracker with its details', () => {
    setup();
    expect(screen.getAllByText('rotokey_13')).toHaveLength(2);
    const first = within(item(6253030));
    expect(first.getByText('ID 6253030 · 5 minutes ago')).toBeInTheDocument();
    expect(first.getByText('Deployed')).toBeInTheDocument();
    expect(first.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText('Showing 3 of 3')).toBeInTheDocument();
  });

  it('shows trackers without a location as disabled', () => {
    setup();
    expect(within(item(42)).getByText('ID 42 · No location')).toBeInTheDocument();
    expect(item(42)).toHaveAttribute('aria-disabled', 'true');
  });

  it('filters by name and id and updates the count', () => {
    setup();
    const search = screen.getByLabelText('Search trackers');
    fireEvent.change(search, { target: { value: 'BIKE' } });
    expect(screen.getByText('Showing 1 of 3')).toBeInTheDocument();
    fireEvent.change(search, { target: { value: '5253' } });
    expect(item(5253030)).toBeInTheDocument();
    expect(item(6253030)).toBeNull();
    fireEvent.change(search, { target: { value: 'zzz' } });
    expect(screen.getByText(/No trackers match/)).toBeInTheDocument();
  });

  it('selects an enabled item and highlights it', () => {
    setup();
    fireEvent.click(item(5253030));
    expect(screen.getByTestId('selected')).toHaveTextContent('5253030');
    expect(item(5253030)).toHaveClass('Mui-selected');
  });

  it('does not select a disabled item', () => {
    setup();
    fireEvent.click(item(42));
    expect(screen.getByTestId('selected')).toHaveTextContent('null');
  });
});
