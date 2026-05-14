import gsap from 'gsap';
import { animation } from '@/lib/design-tokens';

interface CounterOptions {
  duration?: number;
  ease?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  snap?: number;
}

/**
 * Animate a number counting from 0 to `target` inside an HTML element.
 * Returns the GSAP tween so callers can add it to a timeline.
 */
export function animateCounter(
  el: HTMLElement,
  target: number,
  opts: CounterOptions = {},
): gsap.core.Tween {
  const {
    duration = animation.counter.duration,
    ease = animation.counter.ease,
    prefix = '',
    suffix = '',
    decimals = 0,
    snap = 1,
  } = opts;

  // Reduced motion: set final value immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = prefix + formatValue(target, decimals) + suffix;
    return gsap.set({}, {}) as unknown as gsap.core.Tween;
  }

  const proxy = { value: 0 };

  return gsap.to(proxy, {
    value: target,
    duration,
    ease,
    snap: { value: snap },
    onUpdate() {
      el.textContent = prefix + formatValue(proxy.value, decimals) + suffix;
    },
  });
}

function formatValue(value: number, decimals: number): string {
  if (decimals > 0) return value.toFixed(decimals);
  const rounded = Math.round(value);
  return rounded >= 1000
    ? new Intl.NumberFormat('en-CA').format(rounded)
    : String(rounded);
}
