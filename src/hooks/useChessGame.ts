import { useState, useCallback } from 'react';
import { Chess, Square } from 'chess.js';

interface LastMove {
  from: Square;
  to: Square;
}

interface CapturedPieces {
  white: string[];
  black: string[];
}

export interface UseChessGameReturn {
  game: Chess;
  position: string;
  validMoves: Square[];
  lastMove: LastMove | null;
  isGameOver: boolean;
  result: string | null;
  currentTurn: 'w' | 'b';
  isCheckmate: boolean;
  capturedPieces: CapturedPieces;
  onDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
  onSquareClick: (square: Square) => void;
  makeMove: (from: Square, to: Square) => boolean;
  resetGame: () => void;
}

export const useChessGame = (): UseChessGameReturn => {
  const [game, setGame] = useState<Chess>(new Chess());
  const [position, setPosition] = useState<string>(game.fen());
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<CapturedPieces>({
    white: [],
    black: [],
  });

  /**
   * Handle piece drop from react-chessboard
   */
  const onDrop = useCallback((sourceSquare: Square, targetSquare: Square): boolean => {
    try {
      const gameCopy = new Chess(game.fen());
      
      // Attempt the move
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // Always promote to queen for now
      });

      // If move is invalid, return false
      if (move === null) {
        return false;
      }

      // Track captured pieces
      if (move.captured) {
        const capturedPiece = move.captured;
        const capturingColor = move.color === 'w' ? 'white' : 'black';
        
        setCapturedPieces(prev => ({
          ...prev,
          [capturingColor]: [...prev[capturingColor], capturedPiece],
        }));
      }

      // Update game state
      setGame(gameCopy);
      setPosition(gameCopy.fen());
      setLastMove({ from: sourceSquare, to: targetSquare });
      setValidMoves([]);
      setSelectedSquare(null);

      return true;
    } catch (error) {
      console.error('Move error:', error);
      return false;
    }
  }, [game]);

  /**
   * Handle square click to show valid moves
   */
  const onSquareClick = useCallback((square: Square) => {
    const piece = game.get(square);
    
    // If clicking the same square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    // If a square is already selected, try to move
    if (selectedSquare) {
      const moveSuccess = onDrop(selectedSquare, square);
      if (moveSuccess) {
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        // If move failed, select the new square if it has a piece
        if (piece) {
          setSelectedSquare(square);
          const moves = game.moves({ square, verbose: true });
          setValidMoves(moves.map(move => move.to));
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
      return;
    }

    // Select square and show valid moves
    if (piece) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setValidMoves(moves.map(move => move.to));
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  }, [game, selectedSquare, onDrop]);

  /**
   * Make a move programmatically (for multiplayer)
   */
  const makeMove = useCallback((from: Square, to: Square): boolean => {
    try {
      const gameCopy = new Chess(game.fen());
      
      const move = gameCopy.move({
        from,
        to,
        promotion: 'q',
      });

      if (move === null) {
        return false;
      }

      // Track captured pieces
      if (move.captured) {
        const capturedPiece = move.captured;
        const capturingColor = move.color === 'w' ? 'white' : 'black';
        
        setCapturedPieces(prev => ({
          ...prev,
          [capturingColor]: [...prev[capturingColor], capturedPiece],
        }));
      }

      setGame(gameCopy);
      setPosition(gameCopy.fen());
      setLastMove({ from, to });
      setValidMoves([]);
      setSelectedSquare(null);

      return true;
    } catch (error) {
      console.error('Make move error:', error);
      return false;
    }
  }, [game]);

  /**
   * Reset game to initial position
   */
  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setPosition(newGame.fen());
    setValidMoves([]);
    setLastMove(null);
    setSelectedSquare(null);
    setCapturedPieces({ white: [], black: [] });
  }, []);

  return {
    game,
    position,
    validMoves,
    lastMove,
    currentTurn: game.turn(),
    isGameOver: game.isGameOver(),
    result: game.isGameOver() 
      ? game.isCheckmate() 
        ? `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`
        : game.isDraw()
        ? 'Draw!'
        : 'Game over'
      : null,
    capturedPieces,
    isCheckmate: game.isCheckmate(),
    onDrop,
    onSquareClick,
    makeMove,
    resetGame,
  };
};
