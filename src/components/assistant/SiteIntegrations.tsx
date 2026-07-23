'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import ChatFiWidget from './ChatFiWidget';

/**
 * Keep site-wide integrations off the animation-only surface. That route is
 * used for presentation capture and as the decorative Yotin hero embed, where
 * loading ChatFi and Google Identity would add work without adding value.
 */
export default function SiteIntegrations() {
  const pathname = usePathname();
  const animationOnly = pathname.endsWith('/animation');

  if (animationOnly) return null;

  return (
    <>
      <ChatFiWidget />
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
    </>
  );
}
