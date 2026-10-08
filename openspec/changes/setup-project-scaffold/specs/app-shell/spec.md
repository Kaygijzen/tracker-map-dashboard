# Spec Delta

## Purpose

Defines the dashboard's page layout and theming: the top bar, the responsive tracker sidebar, the main content area for the map, and the light/dark theme.

## ADDED Requirements

### Requirement: App bar
The dashboard SHALL show a top app bar with the title "Tracker Map" on every screen size.

#### Scenario: Title is visible
- **WHEN** a user opens the dashboard
- **THEN** a top app bar with the text "Tracker Map" is visible

### Requirement: Permanent sidebar on desktop
On viewports at or above the desktop breakpoint (900px wide), the dashboard SHALL show a left sidebar that is always visible and cannot be closed, and SHALL NOT show a menu button.

#### Scenario: Desktop layout
- **WHEN** the viewport is 1280px wide
- **THEN** the sidebar is visible next to the main content area and no menu button is shown in the app bar

### Requirement: Temporary sidebar on mobile
On viewports below the desktop breakpoint, the sidebar SHALL be hidden by default and SHALL open as an overlay when the user activates a menu button in the app bar.

#### Scenario: Open sidebar on mobile
- **WHEN** the viewport is 375px wide and the user clicks the menu button
- **THEN** the sidebar opens over the content

#### Scenario: Close sidebar on mobile
- **WHEN** the mobile sidebar is open and the user clicks the backdrop or presses Escape
- **THEN** the sidebar closes

#### Scenario: Hidden by default on mobile
- **WHEN** the dashboard loads on a 375px wide viewport
- **THEN** the sidebar is not visible and a menu button is shown in the app bar

### Requirement: Main content area
The dashboard SHALL have a main content area that fills the space below the app bar and beside the sidebar, without page-level scrolling, so it can hold a full-size map.

#### Scenario: Content fills remaining space
- **WHEN** the dashboard is shown at any viewport size
- **THEN** the main content area fills the remaining width and height and the page has no vertical scrollbar

### Requirement: System light/dark theme
The dashboard SHALL use a light theme when the operating system prefers a light color scheme and a dark theme when it prefers dark, and SHALL apply a baseline CSS reset.

#### Scenario: Dark preference
- **WHEN** the browser reports `prefers-color-scheme: dark`
- **THEN** the dashboard renders with a dark background and light text

#### Scenario: Light preference
- **WHEN** the browser reports `prefers-color-scheme: light`
- **THEN** the dashboard renders with a light background and dark text
