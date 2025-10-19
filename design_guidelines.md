# Design Guidelines: Threat Intelligence Platform

## Design Approach
**System-Based Approach**: Carbon Design System + Security Dashboard Patterns
- **Justification**: Enterprise cybersecurity tool requiring data-heavy displays, clear hierarchies, and professional trust
- **Key Principles**: Clarity over decoration, actionable insights, instant readability, trustworthy presentation

## Core Design Elements

### A. Color Palette
**Dark Mode Primary** (professional security aesthetic):
- Background: `222 15% 12%` (deep slate)
- Surface: `222 15% 16%` (elevated panels)
- Surface Elevated: `222 15% 20%` (cards, modals)

**Light Mode Primary**:
- Background: `210 20% 98%` (soft white)
- Surface: `0 0% 100%` (pure white)
- Surface Elevated: `210 15% 96%` (subtle gray)

**Status Colors** (critical for threat intelligence):
- Malicious/Critical: `0 84% 60%` (danger red)
- Suspicious/Warning: `38 92% 50%` (amber)
- Clean/Success: `142 76% 36%` (secure green)
- Unknown/Neutral: `214 32% 56%` (info blue)
- Border/Divider: `220 13% 26%` (dark) / `220 13% 91%` (light)

**Text Hierarchy**:
- Primary Text: `210 20% 98%` (dark) / `222 15% 12%` (light)
- Secondary Text: `215 16% 65%` (dark) / `215 16% 47%` (light)
- Muted Text: `215 14% 50%` (dark) / `215 14% 60%` (light)

### B. Typography
**Font Families**:
- Primary: 'Inter' (Google Fonts) - exceptional readability for data tables
- Monospace: 'JetBrains Mono' - for hashes, IPs, technical data

**Scale**:
- Headings: font-semibold, text-2xl to text-3xl
- Body: font-normal, text-sm to text-base
- Data/Technical: font-mono, text-xs to text-sm
- Labels: font-medium, text-xs uppercase tracking-wide

### C. Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12 (p-2, gap-4, mb-6, mt-8, py-12)
- Consistent 8px grid system for predictable layouts
- Card padding: p-6 or p-8
- Section spacing: py-12 or py-16
- Component gaps: gap-4 or gap-6

### D. Component Library

**Input & Submission Area**:
- Large textarea with monospace font for hash/IP input (min-h-48)
- Drag-and-drop CSV upload zone with dashed border
- Instant validation with inline error indicators (red underline + icon)
- "Scan" button: Large, prominent, with loading state

**Results Dashboard Table**:
- Dense data grid with alternating row backgrounds for scanning ease
- Color-coded status badges (pill-shaped, subtle fill with bold text)
- Sortable column headers with arrow indicators
- Fixed header on scroll for long result sets
- Row hover state with subtle highlight

**Detail Modal/Panel**:
- Full-height slide-in panel from right (lg:w-1/2 max-w-2xl)
- Tabbed sections: Overview, Vendors, Timeline, Context
- Vendor breakdown: Grid of detection cards with logos/icons
- Detection timeline: Vertical timeline with date markers
- Threat context: Expandable accordion sections

**Status Indicators**:
- Icon + text badges (Heroicons: shield-check, shield-exclamation, question-mark-circle)
- Detection count: Bold number with total in muted text (e.g., "12/67 vendors")
- Progress indicators during batch processing

**Export Controls**:
- Dropdown menu with CSV/JSON options
- Secondary button styling with download icon

### E. Animations
**Minimal, purposeful only**:
- Smooth modal slide-in (300ms ease)
- Loading spinners for active scans
- Subtle fade-in for table rows as results populate
- NO decorative animations

## Layout Structure

**Main Submission Interface**:
- Full-width container with max-w-6xl centered
- Two-column split on desktop: Input area (60%) | Quick stats sidebar (40%)
- Mobile: Stacked single column

**Results View**:
- Full-width table container with horizontal scroll on mobile
- Sticky filter bar above results
- Pagination controls at bottom

**Detail Panel**:
- Overlay with backdrop blur
- Scrollable content area with sticky header
- Close button (top-right) + ESC key support

## Images
**No hero images** - This is a utility tool where functionality takes precedence. Focus on:
- Vendor/Engine logos in detection breakdowns (small icons, 24px)
- Optional: Subtle background pattern (hexagonal grid) in empty states
- File type icons for uploaded CSVs

## Key UX Patterns
- Auto-save submitted queries for quick resubmission
- Keyboard shortcuts for power users (Cmd+K for search, Cmd+Enter to submit)
- Real-time validation before submission
- Batch processing with live progress updates
- Quick filters: "Show malicious only", "Show clean only"
- One-click copy for hashes/IPs