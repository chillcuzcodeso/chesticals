'use client';

import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameOverBannerProps {
  visible: boolean;
  isWinner: boolean;
  isDraw?: boolean;
  onDismiss: () => void;
}

export const GameOverBanner: FC<GameOverBannerProps> = ({
  visible,
  isWinner,
  isDraw = false,
  onDismiss,
}) => {
  const title = isDraw ? 'DRAW' : isWinner ? 'VICTORY' : 'CHECKMATE';
  const subtitle = isDraw
    ? 'The game is a draw'
    : isWinner
      ? 'You won the game'
      : 'You have been checkmated';

  const accent = isDraw
    ? 'from-slate-500/30 to-slate-700/30 border-slate-300/30'
    : isWinner
      ? 'from-amber-400/30 to-yellow-600/30 border-amber-300/40'
      : 'from-red-500/30 to-rose-800/30 border-red-400/40';

  const titleColor = isDraw
    ? 'text-slate-100'
    : isWinner
      ? 'text-amber-200'
      : 'text-red-200';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex items-center justify-center rounded-xl bg-black/55 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.7, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className={`mx-4 w-full max-w-sm rounded-2xl border bg-gradient-to-br p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl ${accent}`}
          >
            <p className={`text-4xl font-black tracking-[0.2em] sm:text-5xl ${titleColor}`}>
              {title}
            </p>
            <p className="mt-3 text-sm text-slate-200 sm:text-base">{subtitle}</p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onDismiss}
              className="mt-6 rounded-xl border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/20"
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
