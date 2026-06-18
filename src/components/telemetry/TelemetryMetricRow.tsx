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
      {metrics.map((metric) => {
        const Icon = iconMap[metric.icon] ?? Gauge;
        return (
          <div
            key={metric.label}
            className="telemetry-metric rounded-md border border-white/10 bg-white/[0.035] p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-em-cyan/25 bg-em-cyan/10 text-em-glow">
              <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-heading text-sm font-semibold text-text-primary">
              {metric.label}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              {metric.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
