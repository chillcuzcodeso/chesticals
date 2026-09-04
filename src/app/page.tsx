'use client';

import { FC, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square } from 'chess.js';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { CapturedPieces } from '@/components/chess/CapturedPieces';
import { RoomControls } from '@/components/ui/RoomControls';
import { ThemeSearch } from '@/components/ui/ThemeSearch';
import { HUD } from '@/components/ui/HUD';
import { useChessGame } from '@/hooks/useChessGame';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useTheme } from '@/hooks/useTheme';

const HomePage: FC = () => {
  // Track if the last move was sent (to avoid double-sending)
  const lastSentMoveRef = useRef<{from: string, to: string} | null>(null);
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  const {
    game,
    position,
    validMoves,
    lastMove,
    currentTurn,
    isGameOver,
    result,
    capturedPieces,
    onDrop,
    onSquareClick,
    makeMove,
    resetGame,
  } = useChessGame();

  const {
    roomId,
    playerColor,
    roomStatus,
    isConnected,
    opponentDisconnected,
    isPaused,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMove,
    sendThemeChange,
    pauseGame,
    resumeGame,
    resetGame: resetMultiplayerGame,
    onOpponentMove,
    onThemeUpdate,
    onGamePaused,
    onGameResumed,
    onGameReset,
  } = useMultiplayer();

  const {
    currentTheme,
    isLoading: themeLoading,
    error: themeError,
    applyTheme,
    applyRemoteTheme,
    resetTheme,
  } = useTheme();

  const isOwnPiece = (square: Square): boolean => {
    const piece = game.get(square);
    if (!piece || !playerColor) return false;
    return (
      (piece.color === 'w' && playerColor === 'white') ||
      (piece.color === 'b' && playerColor === 'black')
    );
  };

  /**
   * Handle local move and send to opponent
   */
  const handleDrop = (sourceSquare: Square, targetSquare: Square) => {
    if (roomStatus === 'playing') {
      if (isPaused || isGameOver) return false;
      if (!isOwnPiece(sourceSquare)) return false;
    }

    const success = onDrop(sourceSquare, targetSquare);
    
    if (success && roomId) {
      lastSentMoveRef.current = { from: sourceSquare, to: targetSquare };
      sendMove({ from: sourceSquare, to: targetSquare });
    }

    return success;
  };

  /**
   * Click-to-move: only select your own pieces in a live game
   */
  const handleSquareClick = (square: Square) => {
    if (roomStatus === 'playing') {
      if (isPaused || isGameOver) return;

      const piece = game.get(square);
      const isCaptureTarget = validMoves.includes(square);

      if (piece && !isOwnPiece(square) && !isCaptureTarget) {
        return;
      }
    }

    onSquareClick(square);
  };

  const canDragPiece = (piece: string) => {
    if (roomStatus !== 'playing' || !playerColor) return true;
    if (isPaused || isGameOver) return false;
    const pieceColor = piece.startsWith('w') ? 'white' : 'black';
    return pieceColor === playerColor;
  };

  /**
   * Watch for moves made via click (not drag) and send them
   */
  useEffect(() => {
    if (!lastMove || !roomId || roomStatus !== 'playing') return;
    
    // Check if this move was already sent (via drag-drop)
    const alreadySent = 
      lastSentMoveRef.current?.from === lastMove.from &&
      lastSentMoveRef.current?.to === lastMove.to;
    
    if (!alreadySent) {
      lastSentMoveRef.current = lastMove;
      sendMove({ from: lastMove.from, to: lastMove.to });
    }
  }, [lastMove, roomId, roomStatus, sendMove]);

  /**
   * Register opponent move handler
   */
  useEffect(() => {
    onOpponentMove((move) => {
      makeMove(move.from, move.to);
    });
  }, [onOpponentMove, makeMove]);

  /**
   * Register theme update handler
   */
  useEffect(() => {
    onThemeUpdate((theme) => {
      applyRemoteTheme(theme);
    });
  }, [onThemeUpdate, applyRemoteTheme]);

  /**
   * Register pause/resume handlers
   */
  useEffect(() => {
    onGamePaused(() => {
      console.log('Game paused by opponent');
    });
    onGameResumed(() => {
      console.log('Game resumed by opponent');
    });
    onGameReset(() => {
      resetGame();
    });
  }, [onGamePaused, onGameResumed, onGameReset, resetGame]);

  /**
   * Handle game reset
   */
  const handleGameReset = () => {
    resetGame();
    
    // Sync with opponent if in multiplayer
    if (roomStatus === 'playing') {
      resetMultiplayerGame();
    }
  };

  /**
   * Handle new game
   */
  const handleResetGame = () => {
    resetGame();
    leaveRoom();
  };

  /**
   * Determine board orientation
   */
  const boardOrientation = 
    playerColor === 'black' ? 'black' : 'white';

  const finalResult = result;
  const finalGameOver = isGameOver;

  /**
   * Handle theme search
   */
  const handleThemeSearch = async (query: string) => {
    const theme = await applyTheme(query);

    // Send the exact image + colors so the opponent does not re-fetch Unsplash
    if (theme && roomStatus === 'playing') {
      sendThemeChange(theme);
    }
  };

  /**
   * Handle theme reset
   */
  const handleThemeReset = () => {
    resetTheme();
    if (roomStatus === 'playing') {
      sendThemeChange({
        imageUrl: '',
        query: 'default',
        colors: {
          darkSquare: '#739552',
          lightSquare: '#ebecd0',
          background: 'linear-gradient(to bottom right, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))',
          accent: '#3b82f6',
          vibrant: '#60a5fa',
          muted: '#94a3b8',
        },
      });
    }
  };

  /**
   * Handle music mute toggle
   */
  const handleMusicToggle = () => {
    setIsMusicMuted(!isMusicMuted);
  };

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden">
      {/* Full-viewport background — fixed so it always covers the screen on mobile */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={
          currentTheme?.imageUrl
            ? {
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${currentTheme.imageUrl})`,
              }
            : {
                background:
                  currentTheme?.colors.background ||
                  'linear-gradient(to bottom right, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))',
              }
        }
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/30" />

      {/* HUD */}
      <HUD
        isConnected={isConnected}
        roomId={roomId}
        playerColor={playerColor}
        isMusicMuted={isMusicMuted}
        onMusicToggle={handleMusicToggle}
      />

      {/* Main container */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col px-3 py-4 sm:px-4 sm:py-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 pt-12 text-center sm:mb-6 sm:pt-2"
        >
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl">
            Chesticals
          </h1>
          <p className="text-sm text-slate-300 drop-shadow-md sm:text-lg">
            Real-time multiplayer chess with dynamic themes
          </p>
        </motion.div>

        {/* Theme Search */}
        <ThemeSearch
          onSearch={handleThemeSearch}
          isLoading={themeLoading}
          error={themeError}
          currentQuery={currentTheme?.query !== 'default' ? currentTheme?.query || null : null}
          onReset={handleThemeReset}
        />

        {/* Main Game Container - Glassmorphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex w-full min-w-0 flex-1 items-center justify-center"
        >
          <div className="w-full min-w-0">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:rounded-3xl sm:p-6 md:p-8">
              <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[auto_1fr_auto] lg:gap-6">
                {/* Opponent captures */}
                <div className="flex w-full min-w-0 justify-center lg:justify-end">
                  <div className="w-full lg:w-32">
                    <CapturedPieces
                      pieces={playerColor === 'white' ? capturedPieces.black : capturedPieces.white}
                      color={playerColor === 'white' ? 'black' : 'white'}
                    />
                  </div>
                </div>

                {/* Chess Board */}
                <div className="flex w-full min-w-0 justify-center">
                  <div className="w-full max-w-2xl" style={{ aspectRatio: '1/1' }}>
                    <ChessBoard
                      position={position}
                      validMoves={validMoves}
                      lastMove={lastMove}
                      game={game}
                      orientation={boardOrientation}
                      darkSquareColor={currentTheme?.colors.darkSquare}
                      lightSquareColor={currentTheme?.colors.lightSquare}
                      onDrop={handleDrop}
                      onSquareClick={handleSquareClick}
                      canDragPiece={canDragPiece}
                    />
                  </div>
                </div>

                {/* Your captures */}
                <div className="flex w-full min-w-0 justify-center lg:justify-start">
                  <div className="w-full lg:w-32">
                    <CapturedPieces
                      pieces={playerColor === 'white' ? capturedPieces.white : capturedPieces.black}
                      color={playerColor === 'white' ? 'white' : 'black'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Room Controls */}
        <div className="mt-4 flex w-full justify-center sm:mt-6">
          <RoomControls
            roomId={roomId}
            playerColor={playerColor}
            roomStatus={roomStatus}
            isConnected={isConnected}
            opponentDisconnected={opponentDisconnected}
            currentTurn={currentTurn}
            isGameOver={finalGameOver}
            result={finalResult}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onLeaveRoom={leaveRoom}
            onResetGame={handleResetGame}
          />
        </div>

        {/* Photographer credit */}
        <AnimatePresence>
          {currentTheme?.imageUrl && (currentTheme as any).photographer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-4 left-4 text-xs text-slate-400 z-40"
            >
              Photo by{' '}
              <a
                href={(currentTheme as any).photographerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white underline"
              >
                {(currentTheme as any).photographer}
              </a>
              {' '}on Unsplash
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pause Overlay */}
        <AnimatePresence>
          {isPaused && roomStatus === 'playing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="mx-4 max-w-sm rounded-2xl border border-white/20 bg-black/40 p-6 text-center backdrop-blur-2xl sm:p-8"
              >
                <h2 className="text-3xl font-bold text-white mb-4">⏸️ Game Paused</h2>
                <p className="text-slate-300 mb-6">Waiting for opponent...</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resumeGame}
                  className="backdrop-blur-xl bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-xl px-8 py-3 text-white font-medium"
                >
                  Resume Game
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Controls (only in multiplayer) */}
        {roomStatus === 'playing' && (
          <div className="fixed bottom-4 right-3 z-40 flex flex-col gap-2 sm:bottom-auto sm:right-6 sm:top-24">
            {!isGameOver && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isPaused ? resumeGame : pauseGame}
                className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white font-medium shadow-lg"
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </motion.button>
            )}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGameReset}
              className="backdrop-blur-2xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 rounded-xl px-4 py-2 text-white font-medium shadow-lg"
            >
              🔄 Reset
            </motion.button>
          </div>
        )}

        {/* Music removed - YouTube embeds don't work reliably */}
      </div>
    </div>
  );
};

export default HomePage;
