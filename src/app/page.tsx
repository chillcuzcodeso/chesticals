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
    <div 
      className="min-h-screen transition-all duration-1000 relative"
      style={{
        background: currentTheme?.imageUrl 
          ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${currentTheme.imageUrl})`
          : currentTheme?.colors.background || 'linear-gradient(to bottom right, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

      {/* HUD */}
      <HUD
        isConnected={isConnected}
        roomId={roomId}
        playerColor={playerColor}
        isMusicMuted={isMusicMuted}
        onMusicToggle={handleMusicToggle}
      />

      {/* Main container */}
      <div className="container mx-auto px-4 py-6 relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">
            Chesticals
          </h1>
          <p className="text-slate-300 text-lg drop-shadow-md">
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
          className="flex-1 flex items-center justify-center"
        >
          <div className="w-full max-w-7xl">
            <div className="backdrop-blur-2xl bg-black/30 border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 items-start">
                {/* Left Side - Captured Pieces (opponent's captures from your perspective) */}
                <div className="flex justify-center lg:justify-end">
                  <div className="w-32">
                    <CapturedPieces
                      pieces={playerColor === 'white' ? capturedPieces.black : capturedPieces.white}
                      color={playerColor === 'white' ? 'black' : 'white'}
                    />
                  </div>
                </div>

                {/* Center - Chess Board */}
                <div className="flex justify-center w-full">
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

                {/* Right Side - Your Captured Pieces */}
                <div className="flex justify-center lg:justify-start">
                  <div className="w-32">
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
        <div className="flex justify-center mt-6">
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
                className="backdrop-blur-2xl bg-black/40 border border-white/20 rounded-2xl p-8 text-center"
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
          <div className="fixed top-24 right-6 z-40 flex flex-col gap-2">
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
