# Chesticals - Real-time Multiplayer Chess

A modern, real-time multiplayer chess application built with Next.js 14, TypeScript, and Socket.io.

## Features

- ✅ Local chess gameplay with chess.js validation
- ✅ Chess.com-style move indicators (dots and rings)
- ✅ Last move highlighting
- ✅ Glassmorphic dark UI with Framer Motion animations
- ✅ Real-time multiplayer with Socket.io
- ✅ Room-based matchmaking
- ✅ Automatic color assignment (White/Black)
- ✅ Board flips based on player color
- ✅ Turn-based validation
- ✅ Opponent disconnect handling
- ✅ Manual chess clock (over-the-board style)
- ✅ **Dynamic Theme Engine** with AI-powered color extraction
- ✅ Background wallpapers from Unsplash
- ✅ Chess board colors adapt to theme
- ✅ Ambient music player

## Tech Stack

- **Framework**: Next.js 14 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Chess Logic**: chess.js
- **Board UI**: react-chessboard
- **Animations**: Framer Motion
- **Icons**: lucide-react

## Getting Started

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Copy example file
   cp .env.example .env.local
   
   # Add your Unsplash API key
   UNSPLASH_ACCESS_KEY=your_key_here
   ```

3. **Run both servers**
   ```bash
   npm run dev:all
   ```

   This starts:
   - Next.js frontend: [http://localhost:3000](http://localhost:3000)
   - Socket.io backend: [http://localhost:3001](http://localhost:3001)

### Live Deployment (Free!)

Want to play with friends online? Deploy for free in 10 minutes!

**Quick Deploy:**
See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for step-by-step guide.

**Recommended Stack:**
- Frontend: Vercel (free)
- Backend: Render (free)

**Detailed Guide:**
See [DEPLOYMENT.md](./DEPLOYMENT.md) for all deployment options.

## Project Structure

```
chesticals/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page with multiplayer integration
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── chess/
│   │   │   └── ChessBoard.tsx  # Main chess board component
│   │   └── ui/
│   │       └── RoomControls.tsx # Multiplayer room UI
│   └── hooks/
│       ├── useChessGame.ts     # Chess game logic hook
│       └── useMultiplayer.ts   # Socket.io multiplayer hook
├── server.js                   # Express + Socket.io backend
└── .cursorrules                # AI development guidelines
```

## Development Guidelines

All development follows the rules in `.cursorrules`:
- Components must be under 150 lines
- Strict separation of concerns
- Custom hooks for game logic and networking
- Glassmorphic design system
- TypeScript strict mode

## How to Play Multiplayer

1. **Player 1**: Click "Create Room"
2. **Player 1**: Share the 6-character Room ID with opponent
3. **Player 2**: Enter Room ID and click "Join"
4. **Both Players**: Game starts automatically with Player 1 as White

## Architecture

### Backend (server.js)
- **Express + Socket.io** server on port 3001
- **Room Management**: Create, join, leave rooms
- **Event Broadcasting**: Moves, disconnects, game state
- **Connection Handling**: Automatic cleanup on disconnect

### Frontend Hooks

**useChessGame.ts**
- Chess.js game logic
- Move validation
- Position tracking
- Valid move calculation

**useMultiplayer.ts**
- Socket.io connection
- Room state management
- Color assignment
- Move synchronization

**Integration (page.tsx)**
- Connects both hooks
- Emits local moves to server
- Applies opponent moves to game
- Turn-based validation

## Socket.io Events

### Client → Server
- `create-room` - Create new game room
- `join-room` - Join existing room
- `move` - Send move to opponent
- `leave-room` - Leave current room
- `game-over` - Notify game end

### Server → Client
- `game-start` - Both players connected
- `opponent-move` - Opponent made a move
- `opponent-disconnected` - Opponent left/disconnected
- `game-ended` - Game finished
- `error` - Error message

## Dynamic Theme Engine

Search for any theme (e.g., "Cyberpunk", "Ocean", "Zelda") and watch the app transform:

1. **Background Changes**: High-quality wallpaper from Unsplash
2. **Board Colors Adapt**: AI extracts colors using node-vibrant
3. **Smooth Transitions**: 1-second fade animations
4. **Ambient Music**: Auto-playing themed background music

### Popular Themes to Try
- 🌃 Cyberpunk
- 🏰 Medieval Castle
- 🌲 Forest
- 🌊 Ocean
- 🔥 Fire
- ❄️ Ice
- 🌌 Space
- 🎮 Zelda

See [THEME_ENGINE.md](./THEME_ENGINE.md) for detailed documentation.

## Chess Clock

Manual, over-the-board style clock:
- **15:00** starting time per player
- **Manual punch required**: Making a move doesn't stop your timer
- **Validation**: Can only punch after completing your move
- **Server sync**: Prevents cheating
- **Visual feedback**: Active clock pulses

See [CHESS_CLOCK.md](./CHESS_CLOCK.md) for detailed documentation.

## Future Enhancements

- [ ] Move history panel
- [ ] Captured pieces display
- [ ] Time increment options (Blitz, Rapid, Classical)
- [ ] Spectator mode
- [ ] Game replay
- [ ] ELO rating system
- [ ] Player profiles
- [ ] Chat system
- [ ] Theme favorites/bookmarks
- [ ] Custom color picker
