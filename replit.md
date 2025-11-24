# Poker Royal - Premium Poker Game Platform

## Project Overview

Poker Royal is a real-time, multiplayer poker game with automated gameplay, visible cards, and admin-managed player accounts. The game features a unique 3-round format where all cards are visible to all players, making it purely luck-based.

## Key Features

### Game Mechanics
- **6-player poker tables** with visible cards (no hidden hands)
- **3-round games** with automatic progression
- Each player receives 6 personal cards + 5 community cards
- 10-15 second timer between rounds
- Standard poker hand rankings determine winners
- Tie handling: tied rounds don't count toward wins

### Victory Conditions
- Win 2 rounds → Instant table winner
- 3 different winners → Pot split equally
- Commission automatically deducted (5% default, admin-configurable)

### Admin Features
- Create, edit, suspend, and delete player accounts
- Manage player balances
- Configure commission rates
- View player statistics

### Player Features
- Join tables with varying stake levels ($1, $5, $10, etc.)
- Real-time gameplay with WebSocket updates
- View round history during and after games
- Balance validation (must have 3x stake amount to join)

## Tech Stack

### Frontend
- React with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Socket.IO Client for real-time updates
- Shadcn UI components
- Tailwind CSS with custom poker theme
- Framer Motion for animations

### Backend
- Express.js with TypeScript
- Socket.IO for WebSocket communication
- PostgreSQL with Drizzle ORM
- Pokersolver for hand evaluation
- bcrypt for password hashing
- Express session for authentication

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PlayingCard.tsx      # Card display component
│   │   │   ├── PlayerSeat.tsx       # Player seat with avatar and cards
│   │   │   ├── PokerTable.tsx       # Main poker table interface
│   │   │   ├── TableCard.tsx        # Lobby table card
│   │   │   ├── WinnerModal.tsx      # Winner announcement modal
│   │   │   └── TableHistory.tsx     # Round history sidebar
│   │   ├── pages/
│   │   │   ├── login.tsx            # Login page
│   │   │   ├── lobby.tsx            # Table lobby
│   │   │   ├── game.tsx             # Live game page
│   │   │   └── admin.tsx            # Admin panel
│   │   └── App.tsx                  # Main app with routing
│   └── index.html
├── server/
│   ├── db.ts                        # Database connection
│   ├── storage.ts                   # Data access layer
│   ├── routes.ts                    # API routes & WebSocket handlers
│   ├── seed.ts                      # Database seeding script
│   └── app.ts                       # Express app setup
└── shared/
    └── schema.ts                    # Shared types and database schema
```

## Database Schema

### Users
- Admin and player accounts
- Balance tracking
- Suspension status
- Password hashing

### Tables
- Configurable stake amounts
- Password protection (optional)
- Max 6 players per table

### Games
- Tracks 3-round games
- Pot calculation
- Commission tracking
- Game status (waiting, in_progress, completed)

### Game Players
- Player positions at table
- Rounds won tracking
- Connection status
- Winnings

### Rounds
- Community cards (5)
- Player cards (6 per player)
- Winner determination
- Tie tracking

### Settings
- Commission rate (default 5%)
- Admin-configurable

## Recent Changes

### 2024-11-24: Initial Implementation
- Complete database schema with PostgreSQL
- All frontend components with premium poker aesthetics
- WebSocket server for real-time gameplay
- Poker hand evaluation with pokersolver
- Automatic round progression (12-second rounds)
- Pot calculation with commission
- Admin panel for player management
- Authentication with express-session

## User Credentials

### Admin Account
- Username: `admin`
- Password: `admin123`

## Running the Application

The application runs on a single port (5000) with both frontend and backend:

```bash
npm run dev
```

This starts:
- Express server on port 5000
- Vite dev server (proxied through Express)
- WebSocket server on the same port

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `SESSION_SECRET` - Session encryption key (has default)

## Game Flow

1. Admin creates player accounts with initial balance
2. Players log in and see available tables in lobby
3. Player joins table (must have 3x stake amount)
4. Game starts when 2+ players join
5. Cards dealt automatically (6 personal + 5 community)
6. Round winner determined after 12 seconds
7. Crowns awarded (1 crown per round win)
8. Player with 2 crowns wins table immediately
9. After 3 rounds, pot distributed to winners
10. Commission deducted automatically
11. Balances updated in real-time

## Design Guidelines

### Color Scheme
- Primary: Green (#22a55e) - Poker table felt
- Accent: Gold (#eab308) - Premium accents, pot amounts
- Background: Clean light/dark theme support
- Cards: White with proper suit colors (red/black)

### Typography
- Sans: Inter for UI
- Display: Playfair Display for premium elements
- Font sizes follow hierarchical scale

### Components
- All Shadcn UI components with custom theming
- Hover and active states with elevation system
- Smooth card dealing animations
- Crown icons for round winners
- Real-time pot updates with pulse animation

## Testing

To test the complete flow:

1. Login as admin (admin/admin123)
2. Create a test player with $100 balance
3. Logout and login as test player
4. Join a $1 table
5. Wait for automatic game start (need 2 players minimum)
6. Watch automated gameplay with real-time updates

## Future Enhancements

- Password-protected private tables
- Detailed player statistics and metrics
- Advanced table history with permanent storage
- Configurable table auto-close timers
- Audit logs for game integrity
- Custom stake level creation
