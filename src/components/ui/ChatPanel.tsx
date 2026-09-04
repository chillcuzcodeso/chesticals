'use client';

import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X } from 'lucide-react';
import { ChatMessage } from '@/hooks/useMultiplayer';

interface ChatPanelProps {
  messages: ChatMessage[];
  disabled?: boolean;
  onSend: (text: string) => void;
}

export const ChatPanel: FC<ChatPanelProps> = ({
  messages,
  disabled = false,
  onSend,
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [unread, setUnread] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  useEffect(() => {
    if (open) {
      setUnread(0);
      lastCountRef.current = messages.length;
      return;
    }
    if (messages.length > lastCountRef.current) {
      const incoming = messages.slice(lastCountRef.current);
      const fromOpponent = incoming.filter((m) => !m.self).length;
      if (fromOpponent > 0) setUnread((n) => n + fromOpponent);
    }
    lastCountRef.current = messages.length;
  }, [messages, open]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || disabled) return;
    onSend(draft.trim());
    setDraft('');
  };

  return (
    <div className="fixed bottom-4 left-3 z-40 sm:left-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="mb-3 flex h-72 w-[min(20rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/70 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <p className="text-sm font-medium text-white">Chat</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-2">
              {messages.length === 0 && (
                <p className="pt-8 text-center text-xs text-slate-500">
                  Say hello to your opponent
                </p>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[85%] rounded-xl px-3 py-1.5 text-sm ${
                    message.self
                      ? 'ml-auto bg-blue-500/30 text-blue-50'
                      : 'bg-white/10 text-slate-100'
                  }`}
                >
                  <p className="mb-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                    {message.self ? 'You' : message.from}
                  </p>
                  <p className="break-words">{message.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/10 p-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={200}
                disabled={disabled}
                placeholder={disabled ? 'Chat unavailable' : 'Type a message...'}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder-slate-500 focus:border-blue-400/40"
              />
              <button
                type="submit"
                disabled={disabled || !draft.trim()}
                className="rounded-lg bg-blue-500/30 p-2 text-blue-100 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-2xl"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Chat</span>
        {unread > 0 && !open && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold">
            {unread}
          </span>
        )}
      </motion.button>
    </div>
  );
};
