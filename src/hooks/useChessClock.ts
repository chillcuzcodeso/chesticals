import { useState, useEffect, useCallback, useRef } from 'react';

export type ClockColor = 'white' | 'black' | null;

export interface UseChessClockReturn {
  whiteTime: number;
  blackTime: number;
  activeTimer: ClockColor;
  isWhiteExpired: boolean;
  isBlackExpired: boolean;
  canPunchClock: (color: ClockColor) => boolean;
  startClock: () => void;
  punchClock: (color: ClockColor) => void;
  resetClock: () => void;
}

const INITIAL_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

export const useChessClock = (
  currentTurn: 'w' | 'b',
  onTimeExpired?: (winner: 'white' | 'black') => void
): UseChessClockReturn => {
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
  const [blackTime, setBlackTime] = useState(INITIAL_TIME);
  const [activeTimer, setActiveTimer] = useState<ClockColor>(null);
  const [clockStarted, setClockStarted] = useState(false);
  
  const lastTickRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Update active timer every 100ms
   */
  useEffect(() => {
    if (!activeTimer || !clockStarted) return;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      if (activeTimer === 'white') {
        setWhiteTime(prev => {
          const newTime = Math.max(0, prev - elapsed);
          if (newTime === 0 && onTimeExpired) {
            onTimeExpired('black'); // Black wins
          }
          return newTime;
        });
      } else if (activeTimer === 'black') {
        setBlackTime(prev => {
          const newTime = Math.max(0, prev - elapsed);
          if (newTime === 0 && onTimeExpired) {
            onTimeExpired('white'); // White wins
          }
          return newTime;
        });
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeTimer, clockStarted, onTimeExpired]);

  /**
   * Start the clock (White goes first)
   */
  const startClock = useCallback(() => {
    setActiveTimer('white');
    setClockStarted(true);
    lastTickRef.current = Date.now();
  }, []);

  /**
   * Check if player can punch their clock
   * Rule: Can only punch if opponent's turn on board (meaning you just moved)
   */
  const canPunchClock = useCallback((color: ClockColor): boolean => {
    if (!color || !clockStarted) return false;
    
    // White can punch if it's Black's turn (White just moved)
    // Black can punch if it's White's turn (Black just moved)
    const opponentTurn = color === 'white' ? 'b' : 'w';
    
    // Must be opponent's turn AND your timer must be active
    return currentTurn === opponentTurn && activeTimer === color;
  }, [currentTurn, activeTimer, clockStarted]);

  /**
   * Punch the clock - stops current timer, starts opponent's
   */
  const punchClock = useCallback((color: ClockColor) => {
    if (!canPunchClock(color)) return;

    const opponentColor = color === 'white' ? 'black' : 'white';
    setActiveTimer(opponentColor);
    lastTickRef.current = Date.now();
  }, [canPunchClock]);

  /**
   * Reset clock to initial state
   */
  const resetClock = useCallback(() => {
    setWhiteTime(INITIAL_TIME);
    setBlackTime(INITIAL_TIME);
    setActiveTimer(null);
    setClockStarted(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  return {
    whiteTime,
    blackTime,
    activeTimer,
    isWhiteExpired: whiteTime === 0,
    isBlackExpired: blackTime === 0,
    canPunchClock,
    startClock,
    punchClock,
    resetClock,
  };
};
