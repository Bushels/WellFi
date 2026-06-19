import type { TelemetryContent, TelemetryPlacementMode } from '@/lib/content';

interface TelemetryCutawayStageProps {
  telemetry: TelemetryContent;
  activeModeId?: TelemetryPlacementMode['id'];
}

const modeMeterLabels: Record<TelemetryPlacementMode['id'], string> = {
  'below-pump': 'P intake',
  'behind-casing': 'P annulus',
  'dual-wellfi': 'P1 / P2',
};

export default function TelemetryCutawayStage({
  telemetry,
  activeModeId,
}: TelemetryCutawayStageProps) {
  const belowPumpMode = telemetry.placementModes.find((mode) => mode.id === 'below-pump');
  const pressureCallout = belowPumpMode?.callouts.find(
    (callout) => callout.id === 'intake-pressure',
  );
  const resolvedActiveModeId = activeModeId ?? telemetry.placementModes[0]?.id;

  if (!pressureCallout) {
    throw new Error(
      'TelemetryCutawayStage requires below-pump intake-pressure callout content.',
    );
  }

  return (
    <div className="telemetry-stage overflow-hidden rounded-md border border-white/10 bg-[#05080d] shadow-[0_30px_120px_rgba(0,0,0,0.46)]">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#070b12_0%,#03060a_100%)] p-4 sm:p-6 lg:min-h-[42rem]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:42px_42px] opacity-35"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_45%_47%,rgba(248,113,113,0.12),transparent_26%),radial-gradient(circle_at_58%_70%,rgba(34,211,238,0.10),transparent_24%)]"
          />

          <svg
            className="relative z-10 aspect-[900/640] w-full"
            viewBox="0 0 900 640"
            preserveAspectRatio="xMidYMin meet"
            role="img"
            aria-label="Technical cutaway diagram showing WellFi below-pump, outside-intermediate, and dual-tool telemetry placements."
          >
            <defs>
              <linearGradient id="pipeMetal" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#1f2937" />
                <stop offset="48%" stopColor="#7b8794" />
                <stop offset="100%" stopColor="#111827" />
              </linearGradient>
              <linearGradient id="fluidColumn" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(34,211,238,0.08)" />
                <stop offset="55%" stopColor="rgba(34,211,238,0.34)" />
                <stop offset="100%" stopColor="rgba(248,113,113,0.22)" />
              </linearGradient>
              <filter id="redGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g opacity="0.42">
              <path d="M0 96 C170 64 300 136 454 104 C612 72 724 78 900 44" fill="none" stroke="#374151" strokeWidth="2" />
              <path d="M0 185 C146 154 314 229 475 188 C632 148 750 158 900 122" fill="none" stroke="#273241" strokeWidth="2" />
              <path d="M0 458 C160 420 316 506 492 462 C652 422 742 448 900 404" fill="none" stroke="#273241" strokeWidth="2" />
              <path d="M0 562 C190 522 310 584 464 548 C620 512 742 528 900 490" fill="none" stroke="#334155" strokeWidth="2" />
            </g>

            <g aria-label="wellbore and casing">
              <path
                d="M342 42 C324 154 324 270 348 378 C366 456 372 526 356 604"
                fill="none"
                stroke="#273241"
                strokeWidth="95"
                strokeLinecap="round"
                opacity="0.82"
              />
              <path
                d="M342 42 C324 154 324 270 348 378 C366 456 372 526 356 604"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.35"
              />
              <path
                d="M342 42 C324 154 324 270 348 378 C366 456 372 526 356 604"
                fill="none"
                stroke="url(#pipeMetal)"
                strokeWidth="32"
                strokeLinecap="round"
              />
              <path
                d="M342 72 C328 176 330 280 351 374 C366 442 371 494 363 558"
                fill="none"
                stroke="#03060a"
                strokeWidth="15"
                strokeLinecap="round"
                opacity="0.88"
              />
            </g>

            <g aria-label="hydrostatic fluid column">
              <path
                className="telemetry-fluid-column"
                d="M342 120 C331 205 333 286 351 368 C361 414 366 464 363 520"
                fill="none"
                stroke="url(#fluidColumn)"
                strokeWidth="26"
                strokeLinecap="round"
                opacity="0.95"
              />
              <ellipse
                className="telemetry-hydrostatic-ring"
                cx="354"
                cy="405"
                rx="78"
                ry="54"
                fill="none"
                stroke="rgba(34,211,238,0.72)"
                strokeWidth="2"
                strokeDasharray="6 8"
              />
            </g>

            <g aria-label="pump and WellFi below pump" filter="url(#redGlow)">
              <rect x="304" y="348" width="94" height="92" rx="18" fill="#101827" stroke="#6b7280" strokeWidth="2" />
              <rect x="318" y="446" width="70" height="52" rx="14" fill="#111827" stroke="#f87171" strokeWidth="2" />
              <circle cx="353" cy="472" r="9" fill="#f87171" />
              <circle cx="353" cy="472" r="18" fill="none" stroke="#f87171" strokeWidth="2" opacity="0.6" />
            </g>

            <g aria-label="outside intermediate placement">
              <rect x="218" y="276" width="54" height="88" rx="16" fill="#0b1220" stroke="#f87171" strokeWidth="2" />
              <path d="M245 292 L245 348" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
              <circle cx="245" cy="352" r="6" fill="#f87171" />
              <text x="184" y="260" fill="#fca5a5" className="tech-text" fontSize="12" letterSpacing="3">OUTSIDE INTERMEDIATE</text>
            </g>

            <g aria-label="dual WellFi interval">
              <path d="M575 190 L575 455" stroke="#334155" strokeWidth="4" strokeDasharray="10 11" />
              <rect x="542" y="178" width="66" height="54" rx="14" fill="#0b1220" stroke="#f87171" strokeWidth="2" />
              <rect x="542" y="418" width="66" height="54" rx="14" fill="#0b1220" stroke="#f87171" strokeWidth="2" />
              <circle cx="575" cy="205" r="7" fill="#f87171" />
              <circle cx="575" cy="445" r="7" fill="#f87171" />
              <text x="626" y="209" fill="#fca5a5" className="tech-text" fontSize="14" letterSpacing="3">P1</text>
              <text x="626" y="449" fill="#fca5a5" className="tech-text" fontSize="14" letterSpacing="3">P2</text>
              <text x="518" y="506" fill="#9ca3af" className="tech-text" fontSize="12" letterSpacing="3">DUAL WELLFI INTERVAL</text>
            </g>

            <path
              className="telemetry-leader telemetry-leader-pressure"
              d="M374 472 C464 458 520 396 626 338"
              fill="none"
              stroke="rgba(248,113,113,0.78)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              className="telemetry-leader telemetry-leader-hydrostatic"
              d="M286 396 C226 380 200 344 178 300"
              fill="none"
              stroke="rgba(34,211,238,0.72)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <g aria-label="surface signal">
              <path d="M398 108 C468 92 528 90 590 112" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="7 9" />
              <path d="M430 86 C488 72 542 74 602 92" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="7 9" opacity="0.6" />
              <text x="614" y="116" fill="#9ca3af" className="tech-text" fontSize="12" letterSpacing="3">WIRELESS TO SURFACE</text>
            </g>
          </svg>

          <div className="relative z-20 grid gap-3 lg:block">
            <div className="telemetry-callout telemetry-callout-pressure rounded-md border border-em-glow/35 bg-[#07101a]/92 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.35)] lg:absolute lg:left-[68%] lg:top-[43%] lg:w-[15rem]">
              <p className="tech-text text-[0.65rem] uppercase tracking-[0.22em] text-em-glow">
                {pressureCallout.value}
              </p>
              <h3 className="mt-2 font-heading text-base font-semibold text-text-primary">
                {pressureCallout.label}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                {pressureCallout.description}
              </p>
            </div>

            <div className="telemetry-callout telemetry-callout-hydrostatic rounded-md border border-cyan-200/30 bg-[#061420]/92 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.35)] lg:absolute lg:left-[6%] lg:top-[41%] lg:w-[15rem]">
              <p className="tech-text text-[0.65rem] uppercase tracking-[0.22em] text-cyan-200">
                {telemetry.hydrostaticHead.title}
              </p>
              <h3 className="mt-2 font-heading text-base font-semibold text-text-primary">
                {telemetry.hydrostaticHead.label}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                {telemetry.hydrostaticHead.description}
              </p>
            </div>
          </div>
        </div>

        <aside className="border-t border-white/10 bg-[#08101a] p-4 lg:border-l lg:border-t-0 lg:p-5">
          <div className="mb-4">
            <p className="tech-text text-[0.65rem] uppercase tracking-[0.22em] text-em-glow">
              Application Paths
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Start below the pump. Extend the same wireless telemetry logic where the completion needs it.
            </p>
          </div>

          <div className="telemetry-mode-list grid gap-3">
            {telemetry.placementModes.map((mode) => {
              const isActive = mode.id === resolvedActiveModeId;

              return (
                <article
                  key={mode.id}
                  data-active={isActive ? 'true' : 'false'}
                  data-placement-mode={mode.id}
                  aria-current={isActive ? 'step' : undefined}
                  className={`telemetry-mode rounded-md border p-3 transition-colors ${
                    isActive
                      ? 'border-em-glow/55 bg-em-glow/[0.075]'
                      : 'border-white/10 bg-white/[0.025]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="tech-text text-[0.65rem] uppercase tracking-[0.18em] text-em-glow">
                      {mode.label}
                    </p>
                    <span className="tech-text rounded-sm border border-white/10 bg-white/[0.04] px-2 py-1 text-[0.58rem] uppercase tracking-[0.14em] text-text-secondary">
                      {modeMeterLabels[mode.id]}
                    </span>
                  </div>
                  <h3 className="mt-3 font-heading text-base font-semibold leading-snug text-text-primary">
                    {mode.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                    {mode.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {mode.callouts.map((callout) => (
                      <span
                        key={callout.id}
                        className="rounded-sm border border-white/10 bg-[#05080d] px-2 py-1 text-[0.65rem] text-text-secondary"
                      >
                        {callout.label}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
