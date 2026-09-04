'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { ClockColor } from '@/hooks/useChessClock';

interface ChessClockProps {
  whiteTime: number;
  blackTime: number;
  activeTimer: ClockColor;
  playerColor: 'white' | 'black' | null;
  canPunchWhite: boolean;
  canPunchBlack: boolean;
  onPunchClock: (color: 'white' | 'black') => void;
}

export const ChessClock: FC<ChessClockProps> = ({
  whiteTime,
  blackTime,
  activeTimer,
  playerColor,
  canPunchWhite,
  canPunchBlack,
  onPunchClock,
}) => {
  /**
   * Format milliseconds to MM:SS
   */
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Get clock color based on time remaining
   */
  const getTimeColor = (ms: number, isActive: boolean): string => {
    if (ms === 0) return 'text-red-500';
    if (ms < 30000) return 'text-red-400'; // Under 30 seconds
    if (ms < 60000) return 'text-orange-400'; // Under 1 minute
    if (isActive) return 'text-white';
    return 'text-slate-400';
  };

  /**
   * Render a clock button
   */
  const renderClockButton = (
    color: 'white' | 'black',
    time: number,
    isActive: boolean,
    canPunch: boolean,
    position: 'top' | 'bottom'
  ) => {
    const isPlayer = playerColor === color;
    const timeColor = getTimeColor(time, isActive);
    const isExpired = time === 0;

    return (
      <motion.button
        onClick={() => canPunch && onPunchClock(color)}
        disabled={!canPunch || isExpired}
        animate={isActive && canPunch ? {
          scale: [1, 1.03, 1],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`
          relative w-full backdrop-blur-xl rounded-xl shadow-2xl p-4 transition-all duration-300
          ${isActive && canPunch 
            ? 'bg-blue-500/30 border-2 border-blue-400 cursor-pointer' 
            : isActive
            ? 'bg-blue-500/20 border-2 border-blue-500/50 cursor-not-allowed'
            : 'bg-white/5 border-2 border-white/10 cursor-not-allowed opacity-60'
          }
          ${canPunch ? 'hover:bg-blue-500/40 active:scale-95' : ''}
          ${isExpired ? 'bg-red-500/20 border-red-500' : ''}
        `}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-2 right-2 w-3 h-3 bg-blue-400 rounded-full"
          />
        )}

        <div className="flex items-center justify-between">
          {/* Player info */}
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${
              color === 'white' ? 'bg-white' : 'bg-slate-800 border border-white'
            }`} />
            <div className="text-left">
              <p className="text-white font-bold text-sm">
                {color === 'white' ? 'White' : 'Black'}
              </p>
              {isPlayer && (
                <p className="text-blue-300 text-xs">You</p>
              )}
            </div>
          </div>

          {/* Time display */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={isActive && canPunch ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`font-mono font-bold text-3xl ${timeColor}`}
            >
              {formatTime(time)}
            </motion.div>
            <Clock className={`w-5 h-5 ${timeColor}`} />
          </div>
        </div>

        {/* Instruction text */}
        {isActive && canPunch && isPlayer && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-blue-300 text-xs mt-2 font-medium text-center"
          >
            Click to punch clock!
          </motion.p>
        )}

        {/* Expired message */}
        {isExpired && (
          <p className="text-red-400 text-xs mt-2 font-bold text-center">
            TIME EXPIRED
          </p>
        )}
      </motion.button>
    );
  };

  return (
    <div className="w-full max-w-2xl space-y-3">
      {/* Black clock (top) */}
      {renderClockButton(
        'black',
        blackTime,
        activeTimer === 'black',
        canPunchBlack,
        'top'
      )}

      {/* Spacer */}
      <div className="h-2" />

      {/* White clock (bottom) */}
      {renderClockButton(
        'white',
        whiteTime,
        activeTimer === 'white',
        canPunchWhite,
        'bottom'
      )}
    </div>
  );
};
