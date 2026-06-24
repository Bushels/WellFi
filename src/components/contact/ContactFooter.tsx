'use client';

import { Mail } from 'lucide-react';
import { footer } from '@/lib/content';
import { spacing } from '@/lib/design-tokens';
import GlassPanel from '@/components/ui/GlassPanel';
import WellFiLogo from '@/components/ui/WellFiLogo';

export default function ContactFooter() {
  return (
    <footer
      id="contact"
      className="relative"
      style={{ padding: `${spacing.sectionY} ${spacing.containerX}` }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <GlassPanel glow className="p-10 md:p-16">
          <h2 className="display-heading mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            Review a <span className="text-gradient">Candidate Well</span>
          </h2>
          <p className="text-text-secondary mb-8 text-lg max-w-2xl mx-auto">
            Talk directly with MPS Group about candidate wells, pump changeout timing, and the deployment fit before a field decision.
          </p>

          <a
            href={`mailto:${footer.email}`}
            className="btn-primary inline-flex items-center gap-2 text-lg"
          >
            <Mail size={20} />
            {footer.email}
          </a>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-text-secondary">
              130+ installed internationally
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-text-secondary">
              Exclusive Canadian distributor
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-text-secondary">
              Planned PCP changeout installs
            </span>
          </div>
        </GlassPanel>

        <div className="mt-16 flex flex-col items-center gap-4">
          <WellFiLogo className="h-8 w-auto opacity-40" />
          <div className="flex flex-col gap-1 text-text-secondary text-sm">
            <span>{footer.distributor}</span>
            <span>{footer.copyright}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
