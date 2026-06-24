'use client';

import { useState } from 'react';
import ChatFiLauncher from './ChatFiLauncher';
import ChatFiPanel from './ChatFiPanel';

/**
 * ChatFi — the WellFi site assistant. A warm red "ember" launcher (the candle)
 * that opens a glass chat panel. Mounted once, site-wide, in layout.tsx.
 */
export default function ChatFiWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        @keyframes chatfi-ember {
          0%, 100% { box-shadow: 0 0 14px rgba(239,68,68,0.32), 0 0 34px rgba(239,68,68,0.16); }
          50%      { box-shadow: 0 0 22px rgba(248,113,113,0.50), 0 0 50px rgba(239,68,68,0.26); }
        }
        @keyframes chatfi-rise {
          from { opacity: 0; transform: translateY(14px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatfi-think {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40%           { opacity: 1;    transform: translateY(-2px); }
        }
        .chatfi-ember { animation: chatfi-ember 3.8s ease-in-out infinite; }
        .chatfi-rise  { animation: chatfi-rise 0.3s cubic-bezier(0.2,0.7,0.2,1); }
        @media (prefers-reduced-motion: reduce) {
          .chatfi-ember, .chatfi-rise, .chatfi-think { animation: none !important; }
        }
      `}</style>
      {open ? (
        <ChatFiPanel onClose={() => setOpen(false)} />
      ) : (
        <ChatFiLauncher onOpen={() => setOpen(true)} />
      )}
    </>
  );
}
