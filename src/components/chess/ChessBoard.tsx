'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';

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
  canDragPiece?: (piece: string) => boolean;
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
  canDragPiece,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(() => {
    if (typeof window === 'undefined') return 280;
    return Math.max(200, Math.min(window.innerWidth - 48, 600));
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const width = Math.floor(el.getBoundingClientRect().width);
      if (width > 0) setBoardWidth(width);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handlePieceDrop = (sourceSquare: string, targetSquare: string) => {
    return onDrop(sourceSquare as Square, targetSquare as Square);
  };

  const customSquareStyles = useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};

    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      };
    }

    validMoves.forEach((square) => {
      const piece = game.get(square);

      if (piece) {
        styles[square] = {
          background: `radial-gradient(circle, transparent 60%, rgba(0, 0, 0, 0.3) 65%, rgba(0, 0, 0, 0.5) 70%, transparent 75%)`,
          ...styles[square],
        };
      } else {
        styles[square] = {
          background: `radial-gradient(circle, rgba(0, 0, 0, 0.2) 15%, transparent 20%)`,
          ...styles[square],
        };
      }
    });

    return styles;
  }, [validMoves, lastMove, game]);

  return (
    <div ref={containerRef} className="w-full max-w-full" style={{ aspectRatio: '1/1' }}>
      <Chessboard
        id="main-chessboard"
        position={position}
        onPieceDrop={handlePieceDrop}
        onSquareClick={onSquareClick}
        boardOrientation={orientation}
        customSquareStyles={customSquareStyles}
        boardWidth={boardWidth}
        isDraggablePiece={({ piece }) =>
          canDragPiece ? canDragPiece(piece) : true
        }
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
