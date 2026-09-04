'use client';

import { FC, useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Palette, X } from 'lucide-react';

interface ThemeSearchProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  error: string | null;
  currentQuery: string | null;
  onReset: () => void;
}

const THEME_SUGGESTIONS = [
  '🌃 Cyberpunk',
  '🏰 Medieval Castle',
  '🌲 Forest',
  '🌊 Ocean',
  '🔥 Fire',
  '❄️ Ice',
  '🌌 Space',
  '🎮 Zelda',
  '🌸 Cherry Blossom',
  '🎨 Abstract Art',
];

export const ThemeSearch: FC<ThemeSearchProps> = ({
  onSearch,
  isLoading,
  error,
  currentQuery,
  onReset,
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Remove emoji from suggestion
    const cleanQuery = suggestion.replace(/[^\w\s]/g, '').trim();
    setQuery(cleanQuery);
    onSearch(cleanQuery);
    setShowSuggestions(false);
  };

  return (
    <div className="mx-auto mb-4 w-full max-w-2xl sm:mb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="relative"
      >
        {/* macOS Spotlight-style Search Bar */}
        <form onSubmit={handleSubmit} className="relative">
          <motion.div 
            className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden"
            whileHover={{ 
              borderColor: 'rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(59, 130, 246, 0.15)'
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
              {/* Icon */}
              <motion.div
                animate={isLoading ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
              >
                <Palette className="w-5 h-5 text-blue-400/80 flex-shrink-0" />
              </motion.div>
              
              {/* Input */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search themes..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-base font-light text-white outline-none placeholder-slate-500 disabled:opacity-50 sm:text-lg"
              />

              {/* Keyboard shortcut hint */}
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-md">
                <span className="text-slate-400 text-xs font-medium">⌘</span>
                <span className="text-slate-400 text-xs font-medium">K</span>
              </div>

              {/* Action Button */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  </motion.div>
                ) : currentQuery ? (
                  <motion.button
                    key="reset"
                    type="button"
                    onClick={onReset}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    key="search"
                    type="submit"
                    disabled={!query.trim()}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-blue-400/20"
                  >
                    <Search className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </form>

        {/* Suggestions Dropdown - Command Palette Style */}
        <AnimatePresence>
          {showSuggestions && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-full mt-3 w-full backdrop-blur-2xl bg-black/40 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden z-50"
            >
              <div className="p-3">
                <div className="flex items-center gap-2 px-3 py-2 mb-2">
                  <div className="w-1 h-1 rounded-full bg-blue-400" />
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                    Popular Themes
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {THEME_SUGGESTIONS.map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ 
                        scale: 1.02,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="text-left px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm transition-all border border-transparent hover:border-white/10"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 w-full backdrop-blur-xl bg-red-500/20 border border-red-400/30 rounded-lg px-4 py-2"
            >
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
