import Image from 'next/image';
import type { TelemetryContent } from '@/lib/content';

interface TelemetryCutawayStageProps {
  telemetry: TelemetryContent;
}

export default function TelemetryCutawayStage({ telemetry }: TelemetryCutawayStageProps) {
  return (
    <div className="telemetry-stage relative overflow-hidden rounded-md border border-white/10 bg-[#020408] shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
      <div className="grid min-h-[min(78vh,46rem)] lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative isolate min-h-[34rem] overflow-hidden">
          <Image
            src="/wellfi/wellfi_multilateral_cutaway.png"
            alt="Cutaway wellbore illustration showing WellFi telemetry placement options around pump, casing, and interval layouts."
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover object-center opacity-75"
            priority={false}
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_52%_44%,rgba(248,113,113,0.22),transparent_24%),linear-gradient(180deg,rgba(2,4,8,0.12)_0%,rgba(2,4,8,0.82)_100%)]"
          />

          <div
            aria-hidden="true"
            className="telemetry-fluid-column absolute left-[46%] top-[22%] h-[52%] w-[7%] rounded-full border border-cyan-200/25 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(34,211,238,0.28),rgba(239,68,68,0.18))] shadow-[0_0_40px_rgba(34,211,238,0.12)]"
          />

          <div
            aria-hidden="true"
            className="telemetry-hydrostatic-ring absolute left-[41%] top-[39%] h-[16%] w-[17%] rounded-full border border-em-glow/45 shadow-[0_0_35px_rgba(248,113,113,0.25)]"
          />

          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              className="telemetry-leader telemetry-leader-pressure"
              d="M 50 45 C 61 43, 65 36, 72 32"
              fill="none"
              stroke="rgba(248,113,113,0.75)"
              strokeWidth="0.35"
            />
            <path
              className="telemetry-leader telemetry-leader-hydrostatic"
              d="M 49 58 C 36 58, 31 52, 25 44"
              fill="none"
              stroke="rgba(34,211,238,0.7)"
              strokeWidth="0.3"
            />
          </svg>

          <div className="telemetry-callout telemetry-callout-pressure absolute right-[6%] top-[24%] max-w-[15rem] rounded-md border border-em-glow/35 bg-[#030710]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.45)]">
            <p className="tech-text text-[0.68rem] uppercase tracking-[0.2em] text-em-glow">
              Pressure
            </p>
            <h3 className="mt-2 font-heading text-base font-semibold text-text-primary">
              Pump-intake pressure
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              Measured below the pump where drawdown and lift decisions are made.
            </p>
          </div>

          <div className="telemetry-callout telemetry-callout-hydrostatic absolute left-[6%] top-[40%] max-w-[16rem] rounded-md border border-cyan-200/25 bg-[#03111a]/90 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.45)]">
            <p className="tech-text text-[0.68rem] uppercase tracking-[0.2em] text-cyan-200">
              {telemetry.hydrostaticHead.title}
            </p>
            <h3 className="mt-2 font-heading text-base font-semibold text-text-primary">
              {telemetry.hydrostaticHead.label}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              {telemetry.hydrostaticHead.description}
            </p>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(2,4,8,0)_0%,rgba(2,4,8,0.95)_100%)]" />
        </div>

        <div className="relative border-t border-white/10 bg-[#050b12]/94 p-5 lg:border-l lg:border-t-0 lg:p-6">
          <div className="telemetry-mode-list grid gap-3">
            {telemetry.placementModes.map((mode, index) => (
              <article
                key={mode.id}
                data-placement-mode={mode.id}
                className="telemetry-mode rounded-md border border-white/10 bg-white/[0.035] p-4"
                style={{ opacity: index === 0 ? 1 : 0.45 }}
              >
                <p className="tech-text text-[0.65rem] uppercase tracking-[0.2em] text-em-glow">
                  {mode.eyebrow}
                </p>
                <h3 className="mt-2 font-heading text-lg font-semibold text-text-primary">
                  {mode.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {mode.description}
                </p>
                <ul className="mt-4 grid gap-2">
                  {mode.callouts.map((callout) => (
                    <li
                      key={callout.id}
                      className="flex items-start gap-3 text-xs leading-relaxed text-text-secondary"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-em-glow" />
                      <span>
                        <span className="font-medium text-text-primary">{callout.label}:</span>{' '}
                        {callout.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
