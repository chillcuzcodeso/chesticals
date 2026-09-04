'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Copy, Volume2, VolumeX, Check } from 'lucide-react';
import { useState } from 'react';

interface HUDProps {
  isConnected: boolean;
  roomId: string | null;
  playerColor: 'white' | 'black' | null;
  isMusicMuted: boolean;
  onMusicToggle: () => void;
}

export const HUD: FC<HUDProps> = ({
  isConnected,
  roomId,
  playerColor,
  isMusicMuted,
  onMusicToggle,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed top-6 right-6 z-50"
    >
      <div className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] p-4">
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={isConnected ? {
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`}
            />
            <div className="flex items-center gap-1.5">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className="text-xs font-medium text-slate-300">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </motion.div>

          {/* Divider */}
          {roomId && (
            <div className="w-px h-6 bg-white/10" />
          )}

          {/* Room Code */}
          {roomId && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                  Room
                </span>
                <code className="text-sm font-bold text-white tracking-wider">
                  {roomId}
                </code>
              </div>
              <motion.button
                onClick={handleCopy}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
              </motion.button>
            </motion.div>
          )}

          {/* Divider */}
          {roomId && (
            <div className="w-px h-6 bg-white/10" />
          )}

          {/* Player Color Badge */}
          {playerColor && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5"
            >
              <div className={`w-3 h-3 rounded-full border-2 ${
                playerColor === 'white' 
                  ? 'bg-white border-white' 
                  : 'bg-slate-800 border-white'
              }`} />
              <span className="text-xs font-medium text-slate-300 capitalize">
                {playerColor}
              </span>
            </motion.div>
          )}

          {/* Divider */}
          <div className="w-px h-6 bg-white/10" />

          {/* Music Toggle */}
          <motion.button
            onClick={onMusicToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {isMusicMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-blue-400" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
