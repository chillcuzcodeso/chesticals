'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';

interface CapturedPiecesProps {
  pieces: string[];
  color: 'white' | 'black';
}

const PIECE_SYMBOLS: { [key: string]: string } = {
  p: '♟',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛',
  k: '♚',
};

const PIECE_VALUES: { [key: string]: number } = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
};

export const CapturedPieces: FC<CapturedPiecesProps> = ({ pieces, color }) => {
  // Calculate material value
  const totalValue = pieces.reduce((sum, piece) => sum + (PIECE_VALUES[piece] || 0), 0);

  // Sort pieces by value (highest first)
  const sortedPieces = [...pieces].sort((a, b) => 
    (PIECE_VALUES[b] || 0) - (PIECE_VALUES[a] || 0)
  );

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3 min-h-[80px]">
      <div className="flex flex-col gap-2">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h3 className="text-slate-400 text-xs font-medium uppercase">
            Captured
          </h3>
          {totalValue > 0 && (
            <span className="text-green-400 text-xs font-bold">
              +{totalValue}
            </span>
          )}
        </div>

        {/* Pieces */}
        <div className="flex flex-wrap gap-1">
          {sortedPieces.length > 0 ? (
            sortedPieces.map((piece, index) => (
              <motion.div
                key={`${piece}-${index}`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className={`text-2xl ${
                  color === 'white' ? 'text-white' : 'text-slate-800'
                } drop-shadow-lg`}
              >
                {PIECE_SYMBOLS[piece] || piece}
              </motion.div>
            ))
          ) : (
            <p className="text-slate-500 text-xs">No captures yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
