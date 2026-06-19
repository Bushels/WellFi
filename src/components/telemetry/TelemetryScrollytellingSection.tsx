import { telemetry } from '@/lib/content';
import TelemetryMetricRow from './TelemetryMetricRow';

export default function TelemetryScrollytellingSection() {
  return (
    <section
      id="telemetry"
      aria-labelledby="telemetry-title"
      className="relative isolate overflow-hidden bg-[#020408] px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.08),transparent_34%)]"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <h2
          id="telemetry-title"
          className="text-center font-heading text-[clamp(1.45rem,3.2vw,2.8rem)] font-semibold leading-none text-text-primary"
        >
          {telemetry.title}
        </h2>

        <div className="mt-7">
          <TelemetryMetricRow metrics={telemetry.metrics} />
        </div>
      </div>
    </section>
  );
}
