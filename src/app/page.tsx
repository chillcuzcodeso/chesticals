'use client';

import { FC, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { ChessClock } from '@/components/chess/ChessClock';
import { RoomControls } from '@/components/ui/RoomControls';
import { ThemeSearch } from '@/components/ui/ThemeSearch';
import { MusicPlayer } from '@/components/ui/MusicPlayer';
import { HUD } from '@/components/ui/HUD';
import { useChessGame } from '@/hooks/useChessGame';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useChessClock } from '@/hooks/useChessClock';
import { useTheme } from '@/hooks/useTheme';

const HomePage: FC = () => {
  const [timeExpiredWinner, setTimeExpiredWinner] = useState<string | null>(null);
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  const {
    game,
    position,
    validMoves,
    lastMove,
    currentTurn,
    isGameOver,
    result,
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
    clockState,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMove,
    sendClockPunch,
    onOpponentMove,
    onClockUpdate,
  } = useMultiplayer();

  const {
    whiteTime,
    blackTime,
    activeTimer,
    isWhiteExpired,
    isBlackExpired,
    canPunchClock,
    startClock,
    punchClock,
    resetClock,
  } = useChessClock(currentTurn, (winner) => {
    setTimeExpiredWinner(`${winner.charAt(0).toUpperCase() + winner.slice(1)} wins on time!`);
  });

  const {
    currentTheme,
    isLoading: themeLoading,
    error: themeError,
    applyTheme,
    resetTheme,
  } = useTheme();

  /**
   * Handle local move and send to opponent
   */
  const handleDrop = (sourceSquare: any, targetSquare: any) => {
    // Check if it's player's turn in multiplayer
    if (roomStatus === 'playing' && playerColor) {
      const isPlayerTurn = 
        (currentTurn === 'w' && playerColor === 'white') ||
        (currentTurn === 'b' && playerColor === 'black');
      
      if (!isPlayerTurn) {
        return false; // Not player's turn
      }
    }

    // Make the move locally
    const success = onDrop(sourceSquare, targetSquare);

    // If move succeeded and in multiplayer, send to opponent
    if (success && roomStatus === 'playing') {
      sendMove({ from: sourceSquare, to: targetSquare });
    }

    return success;
  };

  /**
   * Register opponent move handler
   */
  useEffect(() => {
    onOpponentMove((move) => {
      makeMove(move.from, move.to);
    });
  }, [onOpponentMove, makeMove]);

  /**
   * Register clock update handler
   */
  useEffect(() => {
    onClockUpdate((clock) => {
      // Clock state is managed by server in multiplayer
      console.log('Clock synced from server:', clock);
    });
  }, [onClockUpdate]);

  /**
   * Start clock when game starts in multiplayer
   */
  useEffect(() => {
    if (roomStatus === 'playing' && clockState && !activeTimer) {
      startClock();
    }
  }, [roomStatus, clockState, activeTimer, startClock]);

  /**
   * Handle clock punch
   */
  const handlePunchClock = (color: 'white' | 'black') => {
    // Punch local clock
    punchClock(color);
    
    // Send to server if in multiplayer
    if (roomStatus === 'playing') {
      sendClockPunch(color);
    }
  };

  /**
   * Handle new game
   */
  const handleResetGame = () => {
    resetGame();
    resetClock();
    leaveRoom();
    setTimeExpiredWinner(null);
  };

  /**
   * Determine board orientation
   */
  const boardOrientation = 
    playerColor === 'black' ? 'black' : 'white';

  /**
   * Get final result including time expiration
   */
  const finalResult = timeExpiredWinner || result;
  const finalGameOver = isGameOver || isWhiteExpired || isBlackExpired;

  /**
   * Handle theme search
   */
  const handleThemeSearch = async (query: string) => {
    await applyTheme(query);
  };

  /**
   * Handle theme reset
   */
  const handleThemeReset = () => {
    resetTheme();
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
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
                {/* Chess Board */}
                <div className="flex justify-center">
                  <div className="w-full max-w-2xl aspect-square">
                    <ChessBoard
                      position={position}
                      validMoves={validMoves}
                      lastMove={lastMove}
                      game={game}
                      orientation={boardOrientation}
                      darkSquareColor={currentTheme?.colors.darkSquare}
                      lightSquareColor={currentTheme?.colors.lightSquare}
                      onDrop={handleDrop}
                      onSquareClick={onSquareClick}
                    />
                  </div>
                </div>

                {/* Chess Clock - Only in multiplayer */}
                {roomStatus === 'playing' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center lg:justify-start"
                  >
                    <ChessClock
                      whiteTime={whiteTime}
                      blackTime={blackTime}
                      activeTimer={activeTimer}
                      playerColor={playerColor}
                      canPunchWhite={canPunchClock('white')}
                      canPunchBlack={canPunchClock('black')}
                      onPunchClock={handlePunchClock}
                    />
                  </motion.div>
                )}
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

        {/* Hidden Music Player */}
        <MusicPlayer 
          query={currentTheme?.query !== 'default' ? currentTheme?.query || null : null}
          autoPlay={true}
          isMuted={isMusicMuted}
          onMuteChange={setIsMusicMuted}
        />
      </div>
    </div>
  );
};

export default HomePage;
