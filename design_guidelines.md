# Design Guidelines: Premium Poker Game Platform

## Design Approach

**Selected Approach**: Hybrid - Custom Gaming UI + Structured Dashboard System

This application requires a sophisticated blend of engaging game aesthetics for the poker table experience and clean, functional design for administrative and lobby interfaces. Draw inspiration from premium gaming platforms (PokerStars, GGPoker) for the table design, while maintaining the clarity and efficiency of modern admin dashboards (Linear, Retool) for management interfaces.

## Typography System

**Font Families**:
- Primary: Inter (via Google Fonts) - for UI, labels, and body text
- Display: Playfair Display or Cinzel (via Google Fonts) - for table numbers, pot amounts, and premium accents

**Hierarchy**:
- Hero/Display: text-5xl to text-6xl, font-bold (table stakes, pot amounts)
- Section Headers: text-2xl to text-3xl, font-semibold
- Card Labels: text-lg, font-medium (player names, round indicators)
- Body/Interface: text-base, font-normal
- Small Details: text-sm (balance, timestamps)
- Micro Copy: text-xs (tooltips, helper text)

## Layout & Spacing System

**Core Spacing Units**: Use Tailwind spacing of 2, 4, 6, 8, 12, 16, 20, and 24 for consistency (p-2, m-4, gap-6, space-y-8, etc.)

**Container Strategy**:
- Full-width sections: w-full with inner max-w-7xl mx-auto
- Admin panels: max-w-6xl
- Poker table: Fixed aspect ratio container (16:10 or similar) centered with max-w-5xl
- Lobby cards: max-w-sm for individual table cards

## Component Architecture

### 1. Navigation & Layout Structure

**Top Navigation** (persistent across all views):
- Fixed header with app logo/name on left
- Player balance and username on right
- Logout button
- Height: h-16, shadow-sm for subtle depth
- Horizontal padding: px-6

**Admin Navigation** (additional for admin users):
- Vertical sidebar: w-64, fixed left position
- Navigation items with icons and labels
- Sections: Dashboard, Players, Tables, Commission Settings
- Active state with subtle background treatment

### 2. Lobby Interface

**Layout**: Grid-based table card display
- Desktop: grid-cols-3 with gap-6
- Tablet: grid-cols-2
- Mobile: grid-cols-1
- Container padding: p-8

**Table Card Components**:
- Card container: rounded-xl, shadow-lg, p-6
- Stake display at top: text-3xl, font-bold
- Player count indicator: text-base with icon
- Seated players list: max 6 visible names, text-sm, space-y-2
- Join button: Full width at bottom, py-3, rounded-lg
- Lock icon for password-protected tables (top-right corner)

**Empty State**:
- Centered content with icon, heading, and "No tables available" message
- Vertical spacing: space-y-4

### 3. Poker Table Interface

**Table Container**:
- Centered layout with aspect-ratio-[16/10]
- Maximum width: max-w-5xl
- Oval/elliptical table shape using border-radius and transforms
- Padding around table: p-12

**Player Positions** (6 seats arranged around table):
- Each seat: Fixed positioning relative to table center
- Positions: Top-left, Top-center, Top-right, Bottom-left, Bottom-center, Bottom-right
- Seat container: flex flex-col items-center, gap-2

**Player Seat Components**:
- Avatar circle: w-16 h-16, rounded-full
- Player name below avatar: text-sm, font-medium
- Balance display: text-xs
- Crown indicator position: Absolute, top-right of avatar (-top-2 -right-2)
- Card display area: 6 cards in horizontal row, gap-1, each card w-12 h-16

**Community Cards Area**:
- Centered below table: 5 cards in row, gap-2
- Larger cards than player cards: w-16 h-20
- Label above: "Community Cards", text-sm

**Pot Display**:
- Positioned center-top of table
- Container: rounded-full, px-6, py-3
- Amount: text-4xl, font-bold
- Label above: "Total Pot", text-sm

**Round Indicator**:
- Top-left corner of table container
- "Round X of 3" with progress dots
- Timer countdown: text-2xl, font-mono

**Card Design**:
- Rounded corners: rounded-lg
- Shadow for depth: shadow-md
- Rank and suit clearly visible
- Slight rotation for natural feel (rotate-1, -rotate-1 alternating)

### 4. Admin Panel

**Dashboard Layout**:
- Two-column metrics grid: grid-cols-2 gap-4
- Stat cards: p-6, rounded-xl, shadow
- Each stat: Large number (text-4xl), label below (text-sm)
- Metrics: Total Players, Active Tables, Today's Pots, Total Commission

**Player Management Table**:
- Full-width data table with sticky header
- Columns: Username, Balance, Status, Actions
- Row height: h-16, border-b
- Action buttons: Inline, gap-2 (Edit, Suspend/Activate, Delete)
- Search bar above table: Full width, h-12, rounded-lg

**Forms** (Create/Edit Player, Commission Settings):
- Maximum width: max-w-md, centered
- Field spacing: space-y-6
- Label above input: text-sm, font-medium, mb-2
- Input height: h-12, rounded-lg
- Button row at bottom: flex gap-4, justify-end

### 5. Modals & Overlays

**Winner Announcement Modal**:
- Centered overlay with backdrop blur
- Modal container: max-w-lg, rounded-2xl, p-8
- Trophy/crown icon at top: w-20 h-20
- Winner name: text-3xl, font-bold
- Winning hand type: text-xl
- Close button: Automatic dismiss after 5 seconds + manual close option

**Disconnection Warning**:
- Toast-style notification at top-center
- Countdown timer visible
- Width: max-w-md, rounded-lg, p-4
- Icon + message + timer in horizontal layout

**Table History Modal**:
- Sidebar-style slide-in from right: w-96
- Full height, overflow-y-auto
- Round entries: space-y-4
- Each entry: Winner name, hand type, timestamp

### 6. Balance & Status Indicators

**Balance Display** (universal):
- Chip icon + amount
- Always visible in navigation
- Update with smooth number transition

**Crown Indicators**:
- Single crown: w-6 h-6 (round winner)
- Double crown: Two crowns side-by-side (table winner)
- Positioned absolute on avatar

**Status Badges**:
- Player status: Inline badge with rounded-full, px-3, py-1, text-xs
- Active/Suspended states clearly distinguished

## Animations & Transitions

**Card Dealing**: Staggered entrance with slight rotation (150ms delay between cards)
**Pot Update**: Scale pulse on amount change (scale-105 to scale-100)
**Crown Appearance**: Pop-in with bounce effect
**Modal Entry/Exit**: Fade + scale (opacity-0 scale-95 to opacity-100 scale-100)
**Button States**: Subtle transform on hover (hover:-translate-y-0.5)

**Performance**: Use transform and opacity for all animations, avoid layout shifts

## Responsive Behavior

**Desktop** (lg: 1024px+): Full poker table layout with all 6 positions visible
**Tablet** (md: 768px): Maintain table layout, reduce card sizes
**Mobile**: Stack poker table vertically, show players in list format, cards in scrollable rows

Admin panel: Sidebar collapses to hamburger menu on mobile

## Images

**Hero Section**: None - The poker table IS the hero element
**Avatars**: Placeholder avatar images for each player (use avatar generation services or default icons)
**Icons**: Use Heroicons for all interface icons (crown, chip, lock, trophy, user, etc.)