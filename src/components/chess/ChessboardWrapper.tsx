'use client';

import { useEffect } from 'react';

export function ChessboardStyles() {
  useEffect(() => {
    // Import CSS dynamically on client side
    import('react-chessboard/dist/chessboard.min.css');
  }, []);

  return null;
}
