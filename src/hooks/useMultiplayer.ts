import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Square } from 'chess.js';

export type PlayerColor = 'white' | 'black' | null;
export type RoomStatus = 'idle' | 'waiting' | 'playing' | 'finished';

interface Move {
  from: Square;
  to: Square;
}

interface ClockState {
  whiteTime: number;
  blackTime: number;
  activeTimer: 'white' | 'black' | null;
}

export interface UseMultiplayerReturn {
  socket: Socket | null;
  roomId: string | null;
  playerColor: PlayerColor;
  roomStatus: RoomStatus;
  isConnected: boolean;
  opponentDisconnected: boolean;
  clockState: ClockState | null;
  isPaused: boolean;
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  sendMove: (move: Move) => void;
  sendClockPunch: (color: 'white' | 'black') => void;
  sendThemeChange: (theme: any) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  onOpponentMove: (callback: (move: Move) => void) => void;
  onClockUpdate: (callback: (clock: ClockState) => void) => void;
  onThemeUpdate: (callback: (theme: any) => void) => void;
  onGamePaused: (callback: () => void) => void;
  onGameResumed: (callback: () => void) => void;
  onGameReset: (callback: () => void) => void;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const useMultiplayer = (): UseMultiplayerReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<PlayerColor>(null);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('idle');
  const [isConnected, setIsConnected] = useState(false);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [clockState, setClockState] = useState<ClockState | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const opponentMoveCallbackRef = useRef<((move: Move) => void) | null>(null);
  const clockUpdateCallbackRef = useRef<((clock: ClockState) => void) | null>(null);
  const themeUpdateCallbackRef = useRef<((theme: any) => void) | null>(null);
  const gamePausedCallbackRef = useRef<(() => void) | null>(null);
  const gameResumedCallbackRef = useRef<(() => void) | null>(null);
  const gameResetCallbackRef = useRef<(() => void) | null>(null);

  /**
   * Initialize socket connection
   */
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('game-start', ({ players, clock }) => {
      console.log('Game starting with players:', players);
      setRoomStatus('playing');
      if (clock) {
        setClockState(clock);
        if (clockUpdateCallbackRef.current) {
          clockUpdateCallbackRef.current(clock);
        }
      }
    });

    newSocket.on('opponent-move', ({ move }) => {
      console.log('Received opponent move:', move);
      if (opponentMoveCallbackRef.current) {
        opponentMoveCallbackRef.current(move);
      }
    });

    newSocket.on('opponent-disconnected', () => {
      console.log('Opponent disconnected');
      setOpponentDisconnected(true);
      setRoomStatus('finished');
    });

    newSocket.on('clock-update', (clock: ClockState) => {
      console.log('Clock updated:', clock);
      setClockState(clock);
      if (clockUpdateCallbackRef.current) {
        clockUpdateCallbackRef.current(clock);
      }
    });

    newSocket.on('theme-update', ({ theme }) => {
      console.log('Theme updated:', theme);
      if (themeUpdateCallbackRef.current) {
        themeUpdateCallbackRef.current(theme);
      }
    });

    newSocket.on('game-paused', () => {
      console.log('Game paused by opponent');
      setIsPaused(true);
      if (gamePausedCallbackRef.current) {
        gamePausedCallbackRef.current();
      }
    });

    newSocket.on('game-resumed', () => {
      console.log('Game resumed by opponent');
      setIsPaused(false);
      if (gameResumedCallbackRef.current) {
        gameResumedCallbackRef.current();
      }
    });

    newSocket.on('game-reset', ({ clock }) => {
      console.log('Game reset');
      setClockState(clock);
      if (gameResetCallbackRef.current) {
        gameResetCallbackRef.current();
      }
    });

    newSocket.on('game-ended', ({ result }) => {
      console.log('Game ended:', result);
      setRoomStatus('finished');
    });

    newSocket.on('error', ({ message }) => {
      console.error('Socket error:', message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  /**
   * Create a new room
   */
  const createRoom = useCallback(() => {
    if (!socket) return;

    socket.emit('create-room', (response: any) => {
      if (response.success) {
        console.log('Room created:', response.roomId);
        setRoomId(response.roomId);
        setPlayerColor(response.color);
        setRoomStatus('waiting');
        setOpponentDisconnected(false);
      } else {
        console.error('Failed to create room:', response.error);
      }
    });
  }, [socket]);

  /**
   * Join an existing room
   */
  const joinRoom = useCallback((targetRoomId: string) => {
    if (!socket) return;

    socket.emit('join-room', targetRoomId, (response: any) => {
      if (response.success) {
        console.log('Joined room:', response.roomId);
        setRoomId(response.roomId);
        setPlayerColor(response.color);
        setRoomStatus('playing');
        setOpponentDisconnected(false);
      } else {
        console.error('Failed to join room:', response.error);
        alert(`Failed to join room: ${response.error}`);
      }
    });
  }, [socket]);

  /**
   * Leave current room
   */
  const leaveRoom = useCallback(() => {
    if (!socket || !roomId) return;

    socket.emit('leave-room', roomId);
    setRoomId(null);
    setPlayerColor(null);
    setRoomStatus('idle');
    setOpponentDisconnected(false);
  }, [socket, roomId]);

  /**
   * Send a move to the opponent
   */
  const sendMove = useCallback((move: Move) => {
    if (!socket || !roomId) return;

    socket.emit('move', {
      roomId,
      move,
    });
  }, [socket, roomId]);

  /**
   * Send clock punch to server
   */
  const sendClockPunch = useCallback((color: 'white' | 'black') => {
    if (!socket || !roomId) return;

    socket.emit('punch-clock', {
      roomId,
      color,
    });
  }, [socket, roomId]);

  /**
   * Register callback for opponent moves
   */
  const onOpponentMove = useCallback((callback: (move: Move) => void) => {
    opponentMoveCallbackRef.current = callback;
  }, []);

  /**
   * Send theme change to server
   */
  const sendThemeChange = useCallback((theme: any) => {
    if (!socket || !roomId) return;
    socket.emit('theme-change', { roomId, theme });
  }, [socket, roomId]);

  /**
   * Pause game
   */
  const pauseGame = useCallback(() => {
    if (!socket || !roomId) return;
    setIsPaused(true);
    socket.emit('pause-game', { roomId });
  }, [socket, roomId]);

  /**
   * Resume game
   */
  const resumeGame = useCallback(() => {
    if (!socket || !roomId) return;
    setIsPaused(false);
    socket.emit('resume-game', { roomId });
  }, [socket, roomId]);

  /**
   * Reset game (board + clock)
   */
  const resetGame = useCallback(() => {
    if (!socket || !roomId) return;
    socket.emit('reset-game', { roomId });
  }, [socket, roomId]);

  /**
   * Register callback for clock updates
   */
  const onClockUpdate = useCallback((callback: (clock: ClockState) => void) => {
    clockUpdateCallbackRef.current = callback;
  }, []);

  /**
   * Register callback for theme updates
   */
  const onThemeUpdate = useCallback((callback: (theme: any) => void) => {
    themeUpdateCallbackRef.current = callback;
  }, []);

  /**
   * Register callback for game paused
   */
  const onGamePaused = useCallback((callback: () => void) => {
    gamePausedCallbackRef.current = callback;
  }, []);

  /**
   * Register callback for game resumed
   */
  const onGameResumed = useCallback((callback: () => void) => {
    gameResumedCallbackRef.current = callback;
  }, []);

  /**
   * Register callback for game reset
   */
  const onGameReset = useCallback((callback: () => void) => {
    gameResetCallbackRef.current = callback;
  }, []);

  return {
    socket,
    roomId,
    playerColor,
    roomStatus,
    isConnected,
    opponentDisconnected,
    clockState,
    isPaused,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMove,
    sendClockPunch,
    sendThemeChange,
    pauseGame,
    resumeGame,
    resetGame,
    onOpponentMove,
    onClockUpdate,
    onThemeUpdate,
    onGamePaused,
    onGameResumed,
    onGameReset,
  };
};
