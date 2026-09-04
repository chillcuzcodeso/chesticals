'use client';

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Users, LogOut } from 'lucide-react';
import { RoomStatus, PlayerColor } from '@/hooks/useMultiplayer';

interface RoomControlsProps {
  roomId: string | null;
  playerColor: PlayerColor;
  roomStatus: RoomStatus;
  isConnected: boolean;
  opponentDisconnected: boolean;
  currentTurn: 'w' | 'b';
  isGameOver: boolean;
  result: string | null;
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  onLeaveRoom: () => void;
  onResetGame: () => void;
}

export const RoomControls: FC<RoomControlsProps> = ({
  roomId,
  playerColor,
  roomStatus,
  isConnected,
  opponentDisconnected,
  currentTurn,
  isGameOver,
  result,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onResetGame,
}) => {
  const [joinRoomInput, setJoinRoomInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinRoom = () => {
    if (joinRoomInput.trim()) {
      onJoinRoom(joinRoomInput.toUpperCase());
      setJoinRoomInput('');
    }
  };

  // No room - show create/join options
  if (roomStatus === 'idle') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-md flex-col items-center gap-4 px-1"
      >
        <div className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] p-6 w-full">
          <h2 className="text-white text-xl font-bold mb-6 text-center">
            Multiplayer Mode
          </h2>

          {/* Create room */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateRoom}
            disabled={!isConnected}
            className="w-full backdrop-blur-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-xl px-6 py-3.5 text-white font-medium transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            <Users className="inline-block w-5 h-5 mr-2" />
            Create Room
          </motion.button>

          {/* Join room */}
          <div className="flex gap-2">
            <input
              type="text"
              value={joinRoomInput}
              onChange={(e) => setJoinRoomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              placeholder="ROOM ID"
              maxLength={6}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400/50 transition-colors uppercase font-mono text-center tracking-wider"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinRoom}
              disabled={!isConnected || !joinRoomInput.trim()}
              className="backdrop-blur-xl bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-xl px-6 py-3 text-white font-medium transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // In a room
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4"
    >

      {/* Status messages */}
      {roomStatus === 'waiting' && (
        <div className="backdrop-blur-2xl bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-6 py-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
          <p className="text-yellow-100 text-sm font-medium">Waiting for opponent...</p>
        </div>
      )}

      {opponentDisconnected && (
        <div className="backdrop-blur-2xl bg-red-500/20 border border-red-400/30 rounded-xl px-6 py-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
          <p className="text-red-100 text-sm font-medium">Opponent disconnected</p>
        </div>
      )}

      {/* Turn indicator */}
      {roomStatus === 'playing' && !isGameOver && !opponentDisconnected && (
        <div className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-xl px-6 py-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
          <p className="text-slate-200 text-sm font-medium">
            {currentTurn === 'w' ? '⚪ White' : '⚫ Black'} to move
            {((currentTurn === 'w' && playerColor === 'white') || 
              (currentTurn === 'b' && playerColor === 'black')) && (
              <span className="text-blue-400 ml-2">(Your turn)</span>
            )}
          </p>
        </div>
      )}

      {/* Game over message */}
      {isGameOver && result && (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="backdrop-blur-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-xl px-6 py-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
        >
          <p className="text-amber-100 text-lg font-bold">{result}</p>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {(isGameOver || opponentDisconnected) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onResetGame}
            className="backdrop-blur-2xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-xl px-6 py-2.5 text-white font-medium transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
          >
            New Game
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLeaveRoom}
          className="backdrop-blur-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl px-6 py-2.5 text-white font-medium transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
        >
          <LogOut className="inline-block w-4 h-4 mr-2" />
          Leave Room
        </motion.button>
      </div>
    </motion.div>
  );
};
