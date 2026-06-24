'use client';

import { MessageCircle } from 'lucide-react';

export default function ChatFiLauncher({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Ask ChatFi about WellFi"
      className="chatfi-ember fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-navy-void/80 backdrop-blur-md transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE] focus-visible:ring-offset-2 focus-visible:ring-offset-navy-void"
    >
      <MessageCircle size={22} className="text-[#22D3EE]" aria-hidden />
    </button>
  );
}
