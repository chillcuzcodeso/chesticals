# Chess Clock Implementation

## Overview

The chess clock implements **manual, over-the-board style timing** where making a move does NOT automatically stop your timer. Players must physically "punch" their clock button after moving.

## Key Mechanics

### 🎯 Critical Rule
**Making a move on the board DOES NOT stop the player's timer.**

The player's clock continues running until they manually click their clock button. This simulates physical chess clocks used in tournaments.

### ✅ Validation Rules

A player can only punch their clock button if:
1. **It's the opponent's turn** on the chess.js board (meaning the player just completed their move)
2. **Their timer is currently active** (running)
3. **The game is in progress** (not waiting, not finished)

This prevents:
- Punching clock before making a move
- Punching opponent's clock
- Punching clock multiple times
- Clock manipulation

## Implementation

### 1. `useChessClock.ts` Hook (107 lines)

**State Management:**
- `whiteTime` / `blackTime` - Remaining time in milliseconds
- `activeTimer` - Which clock is currently running ('white' | 'black' | null)
- `clockStarted` - Whether the game clock has begun

**Key Functions:**

```typescript
startClock() 
// Starts White's clock when game begins

canPunchClock(color)
// Returns true if player can punch their clock
// Validates: opponent's turn AND player's timer is active

punchClock(color)
// Stops current timer, starts opponent's timer
// Only works if canPunchClock returns true

resetClock()
// Resets both timers to 15:00
```

**Timer Logic:**
- Updates every 100ms for smooth countdown
- Automatically detects time expiration (0:00)
- Triggers `onTimeExpired` callback with winner

### 2. `ChessClock.tsx` Component (149 lines)

**Visual Design:**
- Two large clock buttons (Black top, White bottom)
- Shows time in MM:SS format
- Player indicator ("You" label)
- Active timer indicator (pulsing blue dot)

**Color Coding:**
- White text: Normal time, active
- Slate: Inactive timer
- Orange: < 1 minute remaining
- Red: < 30 seconds or expired

**Pulsing Animation:**
When clock can be punched:
- Button scales: 1 → 1.03 → 1 (1.5s loop)
- Blue border glows
- "Click to punch clock!" instruction pulses
- Active indicator dot pulses opacity

**States:**
- **Disabled**: Can't punch (opponent's turn or wrong color)
- **Active + Can Punch**: Pulses, clickable, instruction visible
- **Active + Can't Punch**: Active indicator but disabled
- **Inactive**: Grayed out, dim
- **Expired**: Red background, "TIME EXPIRED" message

### 3. Server-Side Sync (`server.js`)

**Room Clock State:**
```javascript
clock: {
  whiteTime: 15 * 60 * 1000,  // 15 minutes
  blackTime: 15 * 60 * 1000,
  activeTimer: 'white' | 'black' | null,
  lastUpdate: timestamp
}
```

**Socket Events:**

#### `punch-clock` (Client → Server)
```javascript
socket.emit('punch-clock', { roomId, color })
```

**Server Validation:**
1. Verify room exists and is playing
2. Verify player owns the color they're punching
3. Calculate elapsed time since last update
4. Deduct from active timer
5. Switch active timer
6. Broadcast `clock-update` to both players
7. Check for time expiration

#### `clock-update` (Server → Clients)
```javascript
socket.on('clock-update', { whiteTime, blackTime, activeTimer })
```

**Server as Source of Truth:**
- Server tracks actual elapsed time
- Prevents client-side clock manipulation
- Both players receive same clock state
- Detects time expiration on server

### 4. Integration (`page.tsx`)

**Hooks Coordination:**
```typescript
useChessGame()      // Chess logic
useMultiplayer()    // Socket connection
useChessClock()     // Local clock state
```

**Flow:**

1. **Game Starts** → `startClock()` called, White's timer begins
2. **White Moves** → Timer keeps running
3. **White Punches Clock:**
   - `canPunchClock('white')` checks: Is it Black's turn? ✓
   - `punchClock('white')` locally switches to Black
   - `sendClockPunch('white')` syncs with server
   - Server broadcasts `clock-update` to both players
4. **Black Moves** → Timer keeps running
5. **Black Punches Clock** → Repeat cycle

**Time Expiration:**
- Local hook detects 0:00
- Sets `timeExpiredWinner` state
- Displays "White/Black wins on time!"
- Server also validates and broadcasts `game-ended`

## Visual Feedback

### Active Clock (Punchable)
```
╔══════════════════════════════╗
║  ◉ Active (pulsing)          ║
║  ⚪ White          [15:00] ⏰ ║
║  You                          ║
║  Click to punch clock! ✨     ║
╚══════════════════════════════╝
```
- Glowing blue border (pulses)
- Scale animation
- Instruction text pulses
- Active dot pulses

### Inactive Clock
```
╔══════════════════════════════╗
║  ⚫ Black           14:23  ⏰ ║
╚══════════════════════════════╝
```
- Grayed out
- No animations
- Not clickable

### Time Warning
```
╔══════════════════════════════╗
║  ◉ Active                     ║
║  ⚪ White          [0:28] ⏰  ║
║                   ^^^^^ RED   ║
╚══════════════════════════════╝
```
- Red time display < 30s
- Orange time display < 1min

## Layout

### Desktop (Side-by-Side)
```
┌─────────────┐  ┌────────────┐
│             │  │   BLACK    │
│             │  │   Clock    │
│             │  ├────────────┤
│   Chess     │  │            │
│   Board     │  │            │
│             │  ├────────────┤
│             │  │   WHITE    │
│             │  │   Clock    │
└─────────────┘  └────────────┘
```

### Mobile (Vertical)
```
     ┌────────────┐
     │ BLACK Clock│
     ├────────────┤
     │   Chess    │
     │   Board    │
     ├────────────┤
     │ WHITE Clock│
     └────────────┘
```

## Testing Scenarios

### Scenario 1: Normal Play
1. White moves piece → clock runs
2. White punches clock → Black's clock starts
3. Black moves piece → clock runs
4. Black punches clock → White's clock starts

### Scenario 2: Forgot to Punch
1. White moves piece → clock runs
2. White doesn't punch → clock keeps running
3. Black can't move (White's turn validation)
4. White eventually punches → Black's turn begins

### Scenario 3: Try to Cheat
1. White moves piece
2. White tries to punch opponent's clock → ❌ Blocked (wrong color)
3. White tries to punch before moving → ❌ Blocked (still their turn)
4. White punches after move → ✅ Success

### Scenario 4: Time Expiration
1. White's time reaches 0:00
2. Clock stops automatically
3. Game ends: "Black wins on time!"
4. Both players notified

## Security Features

✅ **Server Validation**
- Verifies player owns the color
- Checks game is in playing state
- Calculates actual elapsed time

✅ **Client Validation**
- Prevents invalid punch attempts
- UI clearly shows when punchable
- Can't punch on own turn

✅ **Synchronization**
- Server is source of truth
- Both clients receive same updates
- Prevents desync exploits

✅ **Time Integrity**
- Server tracks timestamps
- Calculates elapsed server-side
- Can't manipulate client timers

## Future Enhancements

- [ ] Time increment per move (e.g., +5 seconds)
- [ ] Configurable starting time
- [ ] Time control presets (Blitz, Rapid, Classical)
- [ ] Sound effects on clock punch
- [ ] Clock punch history log
- [ ] Undo last clock punch (within 1 second)
- [ ] Auto-punch option (for casual play)
