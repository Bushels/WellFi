import {
  Activity,
  Droplets,
  Gauge,
  Thermometer,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { TelemetryMetric } from '@/lib/content';

const iconMap: Record<string, LucideIcon> = {
  Activity,
  Droplets,
  Gauge,
  Thermometer,
  TrendingUp,
};

interface TelemetryMetricRowProps {
  metrics: TelemetryMetric[];
}

export default function TelemetryMetricRow({ metrics }: TelemetryMetricRowProps) {
  return (
    <div className="telemetry-metric-row grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {metrics.map((metric, index) => {
        const Icon = iconMap[metric.icon] ?? Gauge;
        return (
          <div
            key={metric.label}
            className="telemetry-metric group relative min-h-[9.75rem] overflow-hidden rounded-md border border-white/10 bg-[linear-gradient(180deg,rgba(13,20,31,0.92),rgba(5,9,15,0.96))] p-3 shadow-[0_18px_70px_rgba(0,0,0,0.24)] sm:min-h-[11.5rem] sm:p-4"
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(248,113,113,0),rgba(248,113,113,0.78),rgba(34,211,238,0.28),rgba(248,113,113,0))]"
            />
            <div
              aria-hidden="true"
              className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-em-glow/8 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
            />

            <div className="flex items-start justify-between gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-em-glow/25 bg-em-glow/8 text-em-glow sm:h-10 sm:w-10">
                <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <span className="tech-text rounded-sm border border-white/8 bg-white/[0.035] px-2 py-1 text-[0.58rem] uppercase tracking-[0.16em] text-text-muted">
                CH-{String(index + 1).padStart(2, '0')}
              </span>
            </div>

            <h3 className="mt-4 font-heading text-sm font-semibold text-text-primary sm:mt-5 sm:text-base">
              {metric.label}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary sm:text-sm">
              {metric.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
