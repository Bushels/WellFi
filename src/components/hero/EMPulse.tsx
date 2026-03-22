'use client';

import { forwardRef } from 'react';

interface EMPulseProps {
  className?: string;
}

const EMPulse = forwardRef<SVGSVGElement, EMPulseProps>(
  ({ className }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 100 800"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <filter
          id="pulse-bloom"
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0.133
                    0 0 0 0 0.827
                    0 0 0 0 0.933
                    0 0 0 1 0"
            result="cyan"
          />
          <feMerge>
            <feMergeNode in="cyan" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        className="hero-pulse"
        cx="50"
        cy="700"
        r="5"
        fill="#22D3EE"
        filter="url(#pulse-bloom)"
        opacity="0"
      />
    </svg>
  ),
);

EMPulse.displayName = 'EMPulse';

export default EMPulse;
