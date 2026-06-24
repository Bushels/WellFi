'use client';

import { useCallback, useRef, useState } from 'react';

// The Cloud Run backend URL. Override per-environment with NEXT_PUBLIC_CHATFI_API_URL
// (baked at build time for the static export). Defaults to the deployed MVP service.
const API_URL =
  process.env.NEXT_PUBLIC_CHATFI_API_URL ??
  'https://chatfi-server-851855129205.us-central1.run.app';

export interface ChatFiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ChatFiStatus = 'idle' | 'streaming' | 'error';

const FALLBACK =
  "I can't reach my knowledge right now — you can reach MPS at kylegronning@mpsgroup.ca.";

/**
 * Minimal streaming chat client for ChatFi. Posts the conversation to the Cloud Run
 * /chat endpoint and reads the plain text stream (the backend uses toTextStreamResponse).
 */
export function useChatFi(initial: ChatFiMessage[] = []) {
  const [messages, setMessages] = useState<ChatFiMessage[]>(initial);
  const [status, setStatus] = useState<ChatFiStatus>('idle');
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status === 'streaming') return;

      // History sent to the API = prior turns + this user turn (no empty placeholder).
      const history: ChatFiMessage[] = [...messages, { role: 'user', content: trimmed }];
      setMessages([...history, { role: 'assistant', content: '' }]);
      setStatus('streaming');

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error(`status ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = '';
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: 'assistant', content: acc };
            return copy;
          });
        }
        setStatus('idle');
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          setStatus('idle');
          return;
        }
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: FALLBACK };
          return copy;
        });
        setStatus('error');
      }
    },
    [messages, status],
  );

  return { messages, status, send };
}
