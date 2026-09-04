const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://chesticals.vercel.app',
      'https://*.vercel.app',
      /\.vercel\.app$/,
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Store active rooms
const rooms = new Map();

/**
 * Room structure:
 * {
 *   id: string,
 *   players: [{ id: string, color: 'white' | 'black' }],
 *   gameState: string (FEN),
 *   status: 'waiting' | 'playing' | 'finished',
 *   clock: {
 *     whiteTime: number,
 *     blackTime: number,
 *     activeTimer: 'white' | 'black' | null,
 *     lastUpdate: number
 *   }
 * }
 */

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  /**
   * Create a new room
   */
  socket.on('create-room', (callback) => {
    const roomId = generateRoomId();
    const room = {
      id: roomId,
      players: [{ id: socket.id, color: 'white' }],
      gameState: 'start',
      status: 'waiting',
      clock: {
        whiteTime: 15 * 60 * 1000, // 15 minutes
        blackTime: 15 * 60 * 1000,
        activeTimer: null,
        lastUpdate: Date.now(),
      },
    };

    rooms.set(roomId, room);
    socket.join(roomId);

    console.log(`Room created: ${roomId}`);
    
    callback({
      success: true,
      roomId,
      color: 'white',
      status: 'waiting',
    });
  });

  /**
   * Join an existing room
   */
  socket.on('join-room', (roomId, callback) => {
    const room = rooms.get(roomId);

    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    if (room.players.length >= 2) {
      callback({ success: false, error: 'Room is full' });
      return;
    }

    if (room.status !== 'waiting') {
      callback({ success: false, error: 'Game already in progress' });
      return;
    }

    // Add second player as black
    room.players.push({ id: socket.id, color: 'black' });
    room.status = 'playing';
    socket.join(roomId);

    console.log(`Player joined room: ${roomId}`);

    // Start white's clock
    room.clock.activeTimer = 'white';
    room.clock.lastUpdate = Date.now();

    // Notify both players that game is starting
    io.to(roomId).emit('game-start', {
      players: room.players,
      gameState: room.gameState,
      clock: room.clock,
    });

    callback({
      success: true,
      roomId,
      color: 'black',
      status: 'playing',
    });
  });

  /**
   * Handle move from a player
   */
  socket.on('move', ({ roomId, move }) => {
    console.log(`🎯 SERVER RECEIVED MOVE:`, { roomId, move, socketId: socket.id });
    
    const room = rooms.get(roomId);

    if (!room) {
      console.log(`❌ Room ${roomId} not found!`);
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Verify player is in the room
    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
      console.log(`❌ Player ${socket.id} not in room ${roomId}!`);
      console.log(`Room players:`, room.players.map(p => ({ id: p.id, color: p.color })));
      socket.emit('error', { message: 'Player not in room' });
      return;
    }

    console.log(`✅ Move in room ${roomId} from ${player.color}:`, move);
    console.log(`📤 Broadcasting to room ${roomId} (${room.players.length} players)`);

    // Broadcast move to opponent
    socket.to(roomId).emit('opponent-move', {
      move,
      from: player.color,
    });
    
    console.log(`✅ Emitted opponent-move to room ${roomId}`);
  });

  /**
   * Handle theme change
   */
  socket.on('theme-change', ({ roomId, theme }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    console.log(`Theme changed in room ${roomId}`);

    // Send only to the opponent — echoing back caused the chooser to re-fetch
    socket.to(roomId).emit('theme-update', { theme });
  });

  /**
   * Handle game pause/resume
   */
  socket.on('pause-game', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    socket.to(roomId).emit('game-paused');
  });

  socket.on('resume-game', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    socket.to(roomId).emit('game-resumed');
  });

  /**
   * Handle game reset
   */
  socket.on('reset-game', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    // Reset clock
    room.clock = {
      whiteTime: 15 * 60 * 1000,
      blackTime: 15 * 60 * 1000,
      activeTimer: 'white',
      lastUpdate: Date.now(),
    };

    console.log(`Game reset in room ${roomId}`);

    // Broadcast reset to all players
    io.to(roomId).emit('game-reset', {
      clock: room.clock,
    });
  });

  /**
   * Handle clock punch
   */
  socket.on('punch-clock', ({ roomId, color }) => {
    const room = rooms.get(roomId);

    if (!room || room.status !== 'playing') {
      socket.emit('error', { message: 'Invalid room or game state' });
      return;
    }

    // Verify player is punching their own clock
    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.color !== color) {
      socket.emit('error', { message: 'Cannot punch opponent clock' });
      return;
    }

    // Update timer based on elapsed time
    const now = Date.now();
    const elapsed = now - room.clock.lastUpdate;

    if (room.clock.activeTimer === 'white') {
      room.clock.whiteTime = Math.max(0, room.clock.whiteTime - elapsed);
    } else if (room.clock.activeTimer === 'black') {
      room.clock.blackTime = Math.max(0, room.clock.blackTime - elapsed);
    }

    // Switch active timer
    room.clock.activeTimer = color === 'white' ? 'black' : 'white';
    room.clock.lastUpdate = now;

    console.log(`Clock punched in room ${roomId} by ${color}`);

    // Broadcast updated clock state to both players
    io.to(roomId).emit('clock-update', {
      whiteTime: room.clock.whiteTime,
      blackTime: room.clock.blackTime,
      activeTimer: room.clock.activeTimer,
    });

    // Check for time expiration
    if (room.clock.whiteTime === 0) {
      room.status = 'finished';
      io.to(roomId).emit('game-ended', { result: 'Black wins on time!' });
    } else if (room.clock.blackTime === 0) {
      room.status = 'finished';
      io.to(roomId).emit('game-ended', { result: 'White wins on time!' });
    }
  });

  /**
   * Handle game over
   */
  socket.on('game-over', ({ roomId, result }) => {
    const room = rooms.get(roomId);
    
    if (!room) return;

    room.status = 'finished';
    
    // Stop the clock
    if (room.clock.activeTimer) {
      const now = Date.now();
      const elapsed = now - room.clock.lastUpdate;
      
      if (room.clock.activeTimer === 'white') {
        room.clock.whiteTime = Math.max(0, room.clock.whiteTime - elapsed);
      } else {
        room.clock.blackTime = Math.max(0, room.clock.blackTime - elapsed);
      }
      
      room.clock.activeTimer = null;
    }
    
    io.to(roomId).emit('game-ended', { result });
    
    console.log(`Game over in room ${roomId}: ${result}`);
  });

  /**
   * Handle player disconnect
   */
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);

    // Find and clean up rooms with this player
    rooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        // Notify opponent
        socket.to(roomId).emit('opponent-disconnected');
        
        // Remove room if game was in progress
        if (room.status === 'playing') {
          console.log(`Room ${roomId} closed due to disconnect`);
          rooms.delete(roomId);
        } else if (room.status === 'waiting') {
          // Remove the waiting room
          rooms.delete(roomId);
        }
      }
    });
  });

  /**
   * Leave room manually
   */
  socket.on('leave-room', (roomId) => {
    const room = rooms.get(roomId);
    
    if (room) {
      socket.leave(roomId);
      socket.to(roomId).emit('opponent-disconnected');
      
      // Clean up room
      if (room.status === 'waiting' || room.players.length <= 1) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted`);
      }
    }
  });
});

/**
 * Generate a random 6-character room ID
 */
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    rooms: rooms.size,
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on ${isDev ? 'http://localhost:' + PORT : 'port ' + PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
