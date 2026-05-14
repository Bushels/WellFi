import gsap from 'gsap';

const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&';

interface ScrambleOptions {
  duration?: number;
  charset?: string;
}

/**
 * Terminal-style text decode effect. Characters resolve left-to-right
 * while unresolved positions show random characters.
 * Returns the GSAP tween for timeline integration.
 */
export function animateTextScramble(
  el: HTMLElement,
  finalText: string,
  opts: ScrambleOptions = {},
): gsap.core.Tween {
  const { duration = 1.2, charset = DEFAULT_CHARSET } = opts;

  // Reduced motion: set final text immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = finalText;
    return gsap.set({}, {}) as unknown as gsap.core.Tween;
  }

  const proxy = { progress: 0 };

  return gsap.to(proxy, {
    progress: 1,
    duration,
    ease: 'none',
    onUpdate() {
      const resolvedCount = Math.floor(proxy.progress * finalText.length);
      let output = '';
      for (let i = 0; i < finalText.length; i++) {
        if (finalText[i] === ' ') {
          output += ' ';
        } else if (i < resolvedCount) {
          output += finalText[i];
        } else {
          output += charset[Math.floor(Math.random() * charset.length)];
        }
      }
      el.textContent = output;
    },
    onComplete() {
      el.textContent = finalText;
    },
  });
}
