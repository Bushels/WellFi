'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Send } from 'lucide-react';
import { useChatFi } from '@/lib/useChatFi';
import { chatfi } from '@/lib/content';

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="ChatFi is thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[#22D3EE]"
          style={{ animation: 'chatfi-think 1.2s ease-in-out infinite', animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  );
}

export default function ChatFiPanel({ onClose }: { onClose: () => void }) {
  const { messages, status, send } = useChatFi([{ role: 'assistant', content: chatfi.greeting }]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = () => {
    if (!input.trim() || status === 'streaming') return;
    send(input);
    setInput('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="ChatFi — WellFi assistant"
      className="chatfi-rise glass-panel fixed bottom-6 right-6 z-[60] flex w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden"
      style={{ height: 'min(560px, calc(100vh - 3rem))' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 rounded-full bg-[#22D3EE]"
            style={{ boxShadow: '0 0 10px rgba(34,211,238,0.85)' }}
            aria-hidden
          />
          <div>
            <div className="display-heading text-sm leading-none text-text-primary">{chatfi.title}</div>
            <div className="mt-1 text-[11px] tracking-wide text-text-secondary">{chatfi.subtitle}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close ChatFi"
          className="rounded-md p-1 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]"
        >
          <X size={18} aria-hidden />
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.map((m, i) => {
          const isLast = i === messages.length - 1;
          const thinking = isLast && m.role === 'assistant' && status === 'streaming' && m.content === '';
          return (
            <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={
                  m.role === 'user'
                    ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-white/[0.06] px-3.5 py-2 text-sm text-text-primary'
                    : 'max-w-[92%] whitespace-pre-wrap text-sm leading-relaxed text-text-primary'
                }
              >
                {thinking ? <ThinkingDots /> : m.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input + disclosure */}
      <div className="border-t border-white/10 px-3 pb-2.5 pt-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={chatfi.placeholder}
            className="max-h-28 flex-1 resize-none bg-transparent py-1 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!input.trim() || status === 'streaming'}
            aria-label="Send message"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#06B6D4] text-navy-void transition-opacity duration-200 disabled:opacity-30"
          >
            <Send size={15} aria-hidden />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-text-secondary/80">{chatfi.disclosure}</p>
      </div>
    </div>
  );
}
