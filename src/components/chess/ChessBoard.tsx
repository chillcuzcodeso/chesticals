'use client';

import { FC, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';
import { motion } from 'framer-motion';

interface ChessBoardProps {
  position: string;
  validMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  game: any;
  orientation?: 'white' | 'black';
  darkSquareColor?: string;
  lightSquareColor?: string;
  onDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
  onSquareClick: (square: Square) => void;
}

export const ChessBoard: FC<ChessBoardProps> = ({
  position,
  validMoves,
  lastMove,
  game,
  orientation = 'white',
  darkSquareColor = '#739552',
  lightSquareColor = '#ebecd0',
  onDrop,
  onSquareClick,
}) => {

  /**
   * Generate custom square styles for:
   * 1. Last move highlighting (yellow transparent)
   * 2. Valid move indicators (dots and rings)
   */
  const customSquareStyles = useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};

    // Highlight last move squares
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      };
    }

    // Highlight valid move squares
    validMoves.forEach((square) => {
      const piece = game.get(square);
      
      if (piece) {
        // Square has opponent piece - show hollow ring
        styles[square] = {
          background: `radial-gradient(circle, transparent 60%, rgba(0, 0, 0, 0.3) 65%, rgba(0, 0, 0, 0.5) 70%, transparent 75%)`,
          ...styles[square],
        };
      } else {
        // Empty square - show dot
        styles[square] = {
          background: `radial-gradient(circle, rgba(0, 0, 0, 0.2) 15%, transparent 20%)`,
          ...styles[square],
        };
      }
    });

    return styles;
  }, [validMoves, lastMove, game]);

  return (
    <div className="w-full" style={{ aspectRatio: '1/1' }}>
      <Chessboard
        id="main-chessboard"
        position={position}
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        boardOrientation={orientation}
        customSquareStyles={customSquareStyles}
        boardWidth={600}
        customBoardStyle={{
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        }}
        customDarkSquareStyle={{
          backgroundColor: darkSquareColor,
          transition: 'background-color 1s ease',
        }}
        customLightSquareStyle={{
          backgroundColor: lightSquareColor,
          transition: 'background-color 1s ease',
        }}
      />
    </div>
  );
};
