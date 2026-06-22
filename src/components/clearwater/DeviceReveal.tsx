import Image from 'next/image';
import { clearwater } from '@/lib/content';

/**
 * The isolated device reveal: hi-res transparent render on a cyan ("data")
 * telemetry glow, with the relocated tagline. Presentational — the parent
 * (a ref'd wrapper) fades/scales it in on scroll; in the static fallback the
 * wrapper is a normal block so it shows fully.
 */
export default function DeviceReveal() {
  // Render the tagline from the content single-source-of-truth, keeping the
  // glow accent on the clause after the comma.
  const comma = clearwater.revealTagline.indexOf(',');
  const taglineHead =
    comma === -1 ? clearwater.revealTagline : clearwater.revealTagline.slice(0, comma + 1) + ' ';
  const taglineGlow = comma === -1 ? '' : clearwater.revealTagline.slice(comma + 1).trim();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden="true"
          className="absolute h-[26rem] w-[26rem] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(34,211,238,0.40) 0%, rgba(34,211,238,0.10) 45%, transparent 70%)',
          }}
        />
        <Image
          src="/wellfi/renders/wellfi-device-reveal.png"
          alt={clearwater.deviceAlt}
          width={1600}
          height={6000}
          priority={false}
          className="relative h-[min(62vh,40rem)] w-auto"
        />
      </div>
      <p
        id="clearwater-reveal-tagline"
        className="font-heading text-[clamp(1.6rem,4vw,3rem)] font-semibold tracking-[-0.02em] text-text-primary"
      >
        {taglineHead}
        {taglineGlow && <span className="text-em-glow">{taglineGlow}</span>}
      </p>
    </div>
  );
}
