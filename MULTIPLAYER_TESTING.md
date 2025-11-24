# Multi-Browser Testing Guide

## How to Test Multiplayer Poker Games

### Method 1: Two Browser Tabs (Same Computer)

**Tab 1 (Admin Player):**
```
1. Go to http://localhost:5000
2. Login as admin
   - Username: admin
   - Password: admin123
3. Click "Play Games" button (top right)
4. See available poker tables
```

**Tab 2 (Regular Player):**
```
1. Go to http://localhost:5000 (new tab)
2. Login as a regular player (created in admin panel)
   - Or ask admin to create a test player: "player1" / "password123"
3. See the same poker tables
```

**Join Same Table:**
- Both players click "Join Table" on the same table
- The game will start automatically when 2+ players join
- They see each other's cards, bets, and real-time moves

---

### Method 2: Different Browsers (Same Computer)

**Browser 1 (Chrome):**
- http://localhost:5000
- Login as admin

**Browser 2 (Firefox/Safari/Edge):**
- http://localhost:5000
- Login as regular player

Both see real-time updates instantly via WebSocket!

---

### Method 3: Different Computers on Same Network

**Computer A:**
```
http://[YOUR_COMPUTER_IP]:5000
Login as admin
```

**Computer B:**
```
http://[YOUR_COMPUTER_IP]:5000
Login as regular player
```

Find your computer IP:
- **macOS/Linux:** Run `ifconfig | grep inet`
- **Windows:** Run `ipconfig` (look for "IPv4 Address")

---

## What to Test

### Admin Features:
✓ Edit your own balance
✓ Join a poker table as a player
✓ See real-time cards dealt
✓ Win/lose chips
✓ View other players' hands

### Player Features:
✓ Join tables
✓ Play 3-round games
✓ See community cards
✓ Real-time hand evaluation
✓ Pot calculation

### Real-Time Sync:
- When Admin plays and Player watches another tab
- Cards appear instantly
- Winners determined automatically
- Balances update in real-time

---

## Example Game Flow

**Setup:**
1. Admin: Opens admin panel → clicks "Play Games"
2. Player: Opens separate tab → logs in as regular user
3. Both join the "Beginner Table" ($1 stakes)

**Game Starts:**
- Game automatically begins with 2+ players
- Each gets 6 cards
- 5 community cards shown
- 12-second round timer
- Winner determined by best poker hand
- Pot distributed (minus 5% commission)
- Next round starts automatically

**Test Multi-Round:**
- First round winner gets money
- Second round: Different player might win
- Third round: Game ends, highest earner is table winner
- Both return to lobby

---

## Creating Test Players

In Admin Panel:
1. Click "Players" tab
2. Click "Create User"
3. Username: `player1`, Password: `password123`, Balance: `100`
4. Click "Create User"
5. Repeat for `player2`, `player3`, etc.

---

## Debugging

**Can't see tables?**
- Both browsers logged in? ✓
- Same table URL? (http://localhost:5000) ✓
- Run: `curl http://localhost:5000/api/tables`

**Real-time not syncing?**
- Press F12 → Network tab → look for WebSocket messages
- Should see "game-state" messages flowing between browsers

**Game not starting?**
- Need 2+ players at table
- Check browser console (F12) for errors
- Verify both have enough balance for 3 rounds

---

## Admin Balance Editing

1. In Admin Panel, click "Edit Balance" (next to logout)
2. Change your balance to any amount
3. Click "Update Balance"
4. Go to "Play Games" and join a table
5. Your new balance shows in the lobby

You can now play with unlimited test money!
